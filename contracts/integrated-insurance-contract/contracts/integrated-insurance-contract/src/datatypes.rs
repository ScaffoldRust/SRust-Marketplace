use soroban_sdk::{
    contracttype, Address, BytesN, String,
};

// Insurance policy status
#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum PolicyStatus {
    Active,
    Expired,
    Claimed,
    Cancelled,
}

// Claim status
#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum ClaimStatus {
    Pending,
    UnderReview,
    Approved,
    Rejected,
    Paid,
}

// Risk tier levels
#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum RiskTier {
    Low,
    Medium,
    High,
    VeryHigh,
}

// Insurance policy data structure
#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct InsurancePolicy {
    pub policy_id: u64,
    pub policyholder: Address,
    pub coverage_amount: i128,
    pub premium_paid: i128,
    pub transaction_id: String,
    pub marketplace_address: Address,
    pub risk_tier: RiskTier,
    pub start_date: u64,
    pub expiry_date: u64,
    pub status: PolicyStatus,
    pub nft_token_id: Option<BytesN<32>>,
}

// Claim data structure
#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Claim {
    pub claim_id: u64,
    pub policy_id: u64,
    pub claimant: Address,
    pub amount_claimed: i128,
    pub evidence_hash: BytesN<32>,
    pub submission_date: u64,
    pub status: ClaimStatus,
    pub oracle_confirmations: u32,
    pub required_confirmations: u32,
}

// Risk assessment parameters
#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct RiskParameters {
    pub base_premium_rate: u32, // Basis points (1/10000)
    pub low_risk_multiplier: u32,
    pub medium_risk_multiplier: u32,
    pub high_risk_multiplier: u32,
    pub very_high_risk_multiplier: u32,
    pub transaction_history_weight: u32,
    pub value_risk_threshold: i128,
}

// Premium pool state
#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct PremiumPool {
    pub total_premiums: i128,
    pub total_claims_paid: i128,
    pub invested_funds: i128,
    pub available_funds: i128,
    pub pool_reserve_ratio: u32, // Basis points
}

// Contract state keys
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    PoliciesCount,
    ClaimsCount,
    Policy(u64),
    Claim(u64),
    UserPolicies(Address),
    RiskParams,
    PremiumPool,
    PaymentToken,
    MarketplaceContract,
    OracleAddresses,
}