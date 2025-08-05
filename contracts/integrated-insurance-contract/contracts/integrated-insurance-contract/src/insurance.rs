use soroban_sdk::{
    contract, contractimpl, log, panic_with_error, symbol_short, vec, Address, BytesN, Env, String, Vec,
    token,
};

use crate::datatypes::{
    DataKey, InsurancePolicy, PolicyStatus, RiskParameters, RiskTier, Claim, ClaimStatus, PremiumPool,
};

use crate::error::Error;

#[contract]
pub struct InsuranceContract;

#[contractimpl]
impl InsuranceContract {
    /// Initialize the contract with admin and basic parameters
    pub fn initialize(
        env: Env,
        admin: Address,
        payment_token: Address,
        marketplace_contract: Address,
        risk_params: RiskParameters,
    ) {
        admin.require_auth();
        
        // Set contract admin
        env.storage().instance().set(&DataKey::Admin, &admin);
        
        // Set payment token for premiums
        env.storage().instance().set(&DataKey::PaymentToken, &payment_token);
        
        // Set marketplace contract address
        env.storage().instance().set(&DataKey::MarketplaceContract, &marketplace_contract);
        
        // Initialize counters
        env.storage().persistent().set(&DataKey::PoliciesCount, &0u64);
        env.storage().persistent().set(&DataKey::ClaimsCount, &0u64);
        
        // Set initial risk parameters
        env.storage().instance().set(&DataKey::RiskParams, &risk_params);
        
        // Initialize premium pool
        let initial_pool = PremiumPool {
            total_premiums: 0,
            total_claims_paid: 0,
            invested_funds: 0,
            available_funds: 0,
            pool_reserve_ratio: 2000, // 20% reserve ratio
        };
        env.storage().persistent().set(&DataKey::PremiumPool, &initial_pool);
        
        log!(&env, "Insurance contract initialized");
    }

    /// Purchase insurance coverage for a marketplace transaction
    pub fn purchase_insurance(
        env: Env,
        buyer: Address,
        coverage_amount: i128,
        transaction_id: String,
        marketplace_address: Address,
        duration_days: u64,
    ) -> u64 {
        buyer.require_auth();
        
        // Validate inputs
        if coverage_amount <= 0 {
            panic_with_error!(&env, Error::InvalidCoverage);
        }
        
        // Assess risk and calculate premium
        let risk_tier = Self::assess_transaction_risk(&env, &buyer, coverage_amount, &marketplace_address);
        let premium = Self::calculate_premium(&env, coverage_amount, &risk_tier, duration_days);
        
        // Get payment token
        let payment_token: Address = env.storage().instance().get(&DataKey::PaymentToken).unwrap();
        let token_client = token::Client::new(&env, &payment_token);
        
        // Check buyer has sufficient balance
        let buyer_balance = token_client.balance(&buyer);
        if buyer_balance < premium {
            panic_with_error!(&env, Error::InsufficientFunds);
        }
        
        // Transfer premium to contract
        let contract_address = env.current_contract_address();
        token_client.transfer(&buyer, &contract_address, &premium);
        
        // Generate policy ID
        let mut policy_count: u64 = env.storage().persistent().get(&DataKey::PoliciesCount).unwrap_or(0);
        policy_count += 1;
        env.storage().persistent().set(&DataKey::PoliciesCount, &policy_count);
        
        // Create policy
        let current_time = env.ledger().timestamp();
        let expiry_date = current_time + (duration_days * 24 * 60 * 60);
        
        let policy = InsurancePolicy {
            policy_id: policy_count,
            policyholder: buyer.clone(),
            coverage_amount,
            premium_paid: premium,
            transaction_id: transaction_id.clone(),
            marketplace_address,
            risk_tier,
            start_date: current_time,
            expiry_date,
            status: PolicyStatus::Active,
            nft_token_id: None, // Would mint NFT in production
        };
        
        // Store policy
        env.storage().persistent().set(&DataKey::Policy(policy_count), &policy);
        
        // Update user policies list
        let mut user_policies: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::UserPolicies(buyer.clone()))
            .unwrap_or(vec![&env]);
        user_policies.push_back(policy_count);
        env.storage().persistent().set(&DataKey::UserPolicies(buyer.clone()), &user_policies);
        
        // Update premium pool
        Self::update_premium_pool(&env, premium, 0);
        
        // Emit event - FIXED: Clone the transaction_id
        env.events().publish(
            (symbol_short!("ins_buy"), &buyer),
            (policy_count, coverage_amount, premium, transaction_id.clone())
        );
        
        // FIXED: Remove reference from transaction_id in log
        log!(&env, "Insurance policy {} purchased for transaction {}", policy_count, transaction_id);
        
        policy_count
    }

    /// Submit a claim for an insurance policy
    pub fn submit_claim(
        env: Env,
        claimant: Address,
        policy_id: u64,
        amount_claimed: i128,
        evidence_hash: BytesN<32>,
    ) -> u64 {
        claimant.require_auth();
        
        // Verify policy exists and is valid
        let policy: InsurancePolicy = env.storage()
            .persistent()
            .get(&DataKey::Policy(policy_id))
            .ok_or(Error::PolicyNotFound)
            .unwrap();
        
        // Verify claimant is policyholder
        if policy.policyholder != claimant {
            panic_with_error!(&env, Error::NotAuthorized);
        }
        
        // Check policy is active and not expired
        let current_time = env.ledger().timestamp();
        if policy.status != PolicyStatus::Active || current_time > policy.expiry_date {
            panic_with_error!(&env, Error::PolicyExpired);
        }
        
        // Validate claim amount
        if amount_claimed <= 0 || amount_claimed > policy.coverage_amount {
            panic_with_error!(&env, Error::InvalidCoverage);
        }
        
        // Generate claim ID
        let mut claim_count: u64 = env.storage().persistent().get(&DataKey::ClaimsCount).unwrap_or(0);
        claim_count += 1;
        env.storage().persistent().set(&DataKey::ClaimsCount, &claim_count);
        
        // Create claim
        let claim = Claim {
            claim_id: claim_count,
            policy_id,
            claimant: claimant.clone(),
            amount_claimed,
            evidence_hash,
            submission_date: current_time,
            status: ClaimStatus::Pending,
            oracle_confirmations: 0,
            required_confirmations: Self::get_required_confirmations(&env, &policy.risk_tier),
        };
        
        // Store claim
        env.storage().persistent().set(&DataKey::Claim(claim_count), &claim);
        
        // Emit event
        env.events().publish(
            (symbol_short!("claim_sub"), &claimant),
            (claim_count, policy_id, amount_claimed)
        );
        
        log!(&env, "Claim {} submitted for policy {}", claim_count, policy_id);
        
        claim_count
    }

    /// Oracle function to confirm claim validity
    pub fn confirm_claim(env: Env, oracle: Address, claim_id: u64, is_valid: bool) {
        oracle.require_auth();
        
        // Verify oracle is authorized
        let oracle_addresses: Vec<Address> = env.storage()
            .instance()
            .get(&DataKey::OracleAddresses)
            .unwrap_or(vec![&env]);
        
        if !oracle_addresses.contains(&oracle) {
            panic_with_error!(&env, Error::NotAuthorized);
        }
        
        // Get claim
        let mut claim: Claim = env.storage()
            .persistent()
            .get(&DataKey::Claim(claim_id))
            .ok_or(Error::ClaimNotFound)
            .unwrap();
        
        // Update claim status
        if is_valid && claim.status == ClaimStatus::Pending {
            claim.oracle_confirmations += 1;
            claim.status = ClaimStatus::UnderReview;
            
            // Check if we have enough confirmations
            if claim.oracle_confirmations >= claim.required_confirmations {
                claim.status = ClaimStatus::Approved;
                Self::process_approved_claim(&env, &claim);
            }
        } else if !is_valid {
            claim.status = ClaimStatus::Rejected;
        }
        
        // Update claim
        env.storage().persistent().set(&DataKey::Claim(claim_id), &claim);
        
        // Emit event
        env.events().publish(
            (symbol_short!("claim_cnf"), &oracle),
            (claim_id, is_valid, claim.oracle_confirmations)
        );
    }

    /// Process approved claim and make payout
    fn process_approved_claim(env: &Env, claim: &Claim) {
        // Check pool has sufficient funds
        let pool: PremiumPool = env.storage().persistent().get(&DataKey::PremiumPool).unwrap();
        if pool.available_funds < claim.amount_claimed {
            panic_with_error!(env, Error::InsufficientPoolFunds);
        }
        
        // Get payment token and make payout
        let payment_token: Address = env.storage().instance().get(&DataKey::PaymentToken).unwrap();
        let token_client = token::Client::new(env, &payment_token);
        let contract_address = env.current_contract_address();
        
        token_client.transfer(&contract_address, &claim.claimant, &claim.amount_claimed);
        
        // Update policy status
        let mut policy: InsurancePolicy = env.storage()
            .persistent()
            .get(&DataKey::Policy(claim.policy_id))
            .unwrap();
        policy.status = PolicyStatus::Claimed;
        env.storage().persistent().set(&DataKey::Policy(claim.policy_id), &policy);
        
        // Update premium pool
        Self::update_premium_pool(env, 0, claim.amount_claimed);
        
        // Update claim status
        let mut updated_claim = claim.clone();
        updated_claim.status = ClaimStatus::Paid;
        env.storage().persistent().set(&DataKey::Claim(claim.claim_id), &updated_claim);
        
        // Emit event
        env.events().publish(
            (symbol_short!("claim_pay"), &claim.claimant),
            (claim.claim_id, claim.amount_claimed)
        );
        
        log!(env, "Claim {} paid: {} tokens", claim.claim_id, claim.amount_claimed);
    }

    /// Calculate premium based on coverage amount, risk tier, and duration
    fn calculate_premium(env: &Env, coverage_amount: i128, risk_tier: &RiskTier, duration_days: u64) -> i128 {
        let risk_params: RiskParameters = env.storage().instance().get(&DataKey::RiskParams).unwrap();
        
        let base_rate = risk_params.base_premium_rate as i128; // Basis points
        let risk_multiplier = match risk_tier {
            RiskTier::Low => risk_params.low_risk_multiplier,
            RiskTier::Medium => risk_params.medium_risk_multiplier,
            RiskTier::High => risk_params.high_risk_multiplier,
            RiskTier::VeryHigh => risk_params.very_high_risk_multiplier,
        } as i128;
        
        // Calculate base premium (coverage * base_rate / 10000)
        let mut premium = (coverage_amount * base_rate) / 10000;
        
        // Apply risk multiplier
        premium = (premium * risk_multiplier) / 100;
        
        // Apply duration factor (assumes base rate is for 30 days)
        let duration_factor = (duration_days as i128 * 100) / 30;
        premium = (premium * duration_factor) / 100;
        
        // Minimum premium of 1 token
        if premium < 1 {
            premium = 1;
        }
        
        premium
    }

    /// Assess transaction risk based on multiple factors
    fn assess_transaction_risk(
        env: &Env, 
        buyer: &Address, 
        coverage_amount: i128, 
        marketplace: &Address
    ) -> RiskTier {
        let risk_params: RiskParameters = env.storage().instance().get(&DataKey::RiskParams).unwrap();
        
        // Get user's transaction history (simplified)
        let user_policies: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::UserPolicies(buyer.clone()))
            .unwrap_or(vec![&env]);
        
        let transaction_count = user_policies.len();
        
        // Calculate risk score based on multiple factors
        let mut risk_score = 0u32;
        
        // Factor 1: Transaction value
        if coverage_amount > risk_params.value_risk_threshold {
            risk_score += 30;
        } else if coverage_amount > risk_params.value_risk_threshold / 2 {
            risk_score += 15;
        }
        
        // Factor 2: User history
        if transaction_count == 0 {
            risk_score += 25; // New user
        } else if transaction_count < 5 {
            risk_score += 15; // Limited history
        } else if transaction_count > 20 {
            risk_score -= 10; // Experienced user (subtract risk)
        }
        
        // Factor 3: Marketplace reputation (simplified)
        // In production, this would check marketplace statistics
        let marketplace_contract: Address = env.storage().instance().get(&DataKey::MarketplaceContract).unwrap();
        if marketplace != &marketplace_contract {
            risk_score += 20; // Unknown marketplace
        }
        
        // Determine risk tier based on score
        match risk_score {
            0..=20 => RiskTier::Low,
            21..=40 => RiskTier::Medium,
            41..=60 => RiskTier::High,
            _ => RiskTier::VeryHigh,
        }
    }

    /// Get required oracle confirmations based on risk tier
    fn get_required_confirmations(_env: &Env, risk_tier: &RiskTier) -> u32 {
        match risk_tier {
            RiskTier::Low => 1,
            RiskTier::Medium => 2,
            RiskTier::High => 3,
            RiskTier::VeryHigh => 5,
        }
    }

    /// Update premium pool state
    fn update_premium_pool(env: &Env, premium_collected: i128, claim_paid: i128) {
        let mut pool: PremiumPool = env.storage().persistent().get(&DataKey::PremiumPool).unwrap();
        
        pool.total_premiums += premium_collected;
        pool.total_claims_paid += claim_paid;
        pool.available_funds = pool.available_funds + premium_collected - claim_paid;
        
        env.storage().persistent().set(&DataKey::PremiumPool, &pool);
    }

    // Query functions

    /// Get policy details by ID
    pub fn get_policy(env: Env, policy_id: u64) -> Option<InsurancePolicy> {
        env.storage().persistent().get(&DataKey::Policy(policy_id))
    }

    /// Get claim details by ID
    pub fn get_claim(env: Env, claim_id: u64) -> Option<Claim> {
        env.storage().persistent().get(&DataKey::Claim(claim_id))
    }

    /// Get user's policies
    pub fn get_user_policies(env: Env, user: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::UserPolicies(user))
            .unwrap_or(vec![&env])
    }

    /// Get premium pool status
    pub fn get_premium_pool(env: Env) -> PremiumPool {
        env.storage().persistent().get(&DataKey::PremiumPool).unwrap()
    }

    /// Calculate premium quote without purchasing
    pub fn get_premium_quote(
        env: Env,
        buyer: Address,
        coverage_amount: i128,
        marketplace_address: Address,
        duration_days: u64,
    ) -> i128 {
        let risk_tier = Self::assess_transaction_risk(&env, &buyer, coverage_amount, &marketplace_address);
        Self::calculate_premium(&env, coverage_amount, &risk_tier, duration_days)
    }

    // Admin functions

    /// Update risk parameters (admin only)
    pub fn update_risk_parameters(env: Env, admin: Address, new_params: RiskParameters) {
        admin.require_auth();
        
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if admin != stored_admin {
            panic_with_error!(&env, Error::NotAuthorized);
        }
        
        env.storage().instance().set(&DataKey::RiskParams, &new_params);
        
        log!(&env, "Risk parameters updated");
    }

    /// Add authorized oracle (admin only)
    pub fn add_oracle(env: Env, admin: Address, oracle: Address) {
        admin.require_auth();
        
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if admin != stored_admin {
            panic_with_error!(&env, Error::NotAuthorized);
        }
        
        let mut oracles: Vec<Address> = env.storage()
            .instance()
            .get(&DataKey::OracleAddresses)
            .unwrap_or(vec![&env]);
        
        if !oracles.contains(&oracle) {
            oracles.push_back(oracle.clone());
            env.storage().instance().set(&DataKey::OracleAddresses, &oracles);
        }
        
        log!(&env, "Oracle added: {}", oracle);
    }

    /// Emergency pause function (admin only)
    pub fn emergency_pause(env: Env, admin: Address) {
        admin.require_auth();
        
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if admin != stored_admin {
            panic_with_error!(&env, Error::NotAuthorized);
        }
        
        // Implementation would set a pause flag
        log!(&env, "Contract paused by admin");
    }

    /// Marketplace integration: Purchase insurance as part of transaction
    pub fn marketplace_purchase_insurance(
        env: Env,
        marketplace: Address,
        buyer: Address,
        _seller: Address,  // Fixed: prefixed with underscore
        coverage_amount: i128,
        transaction_id: String,
        duration_days: u64,
    ) -> u64 {
        marketplace.require_auth();
        
        // Verify marketplace is authorized
        let authorized_marketplace: Address = env.storage().instance().get(&DataKey::MarketplaceContract).unwrap();
        if marketplace != authorized_marketplace {
            panic_with_error!(&env, Error::MarketplaceNotIntegrated);
        }
        
        // Purchase insurance on behalf of buyer
        Self::purchase_insurance(env, buyer, coverage_amount, transaction_id, marketplace, duration_days)
    }

    /// Get insurance options for marketplace UI
    pub fn get_insurance_options(
        env: Env,
        buyer: Address,
        transaction_value: i128,
        marketplace_address: Address,
    ) -> Vec<(i128, i128, RiskTier)> { // (coverage, premium, risk_tier)
        let mut options = vec![&env];
        
        // Offer multiple coverage tiers
        let coverage_tiers = vec![&env, transaction_value / 2, transaction_value * 3 / 4, transaction_value];
        
        for coverage in coverage_tiers {
            let risk_tier = Self::assess_transaction_risk(&env, &buyer, coverage, &marketplace_address);
            let premium = Self::calculate_premium(&env, coverage, &risk_tier, 30); // Default 30 days
            options.push_back((coverage, premium, risk_tier));
        }
        
        options
    }
}