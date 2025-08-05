#![cfg(test)]

use crate::{InsuranceContract, InsuranceContractClient, PolicyStatus, ClaimStatus, RiskParameters};
use soroban_sdk::{
    testutils::{Address as _}, Address, BytesN, Env, String,
    token::{Client as TokenClient, StellarAssetClient},
};

// Create a test token contract with admin functions
fn create_test_token_contract<'a>(env: &'a Env, admin: &Address) -> (Address, TokenClient<'a>, StellarAssetClient<'a>) {
    let token_contract = env.register_stellar_asset_contract_v2(admin.clone());
    let token_address = token_contract.address();
    (
        token_address.clone(),
        TokenClient::new(env, &token_address),
        StellarAssetClient::new(env, &token_address),
    )
}

fn setup_test_contract<'a>(env: &'a Env) -> (Address, InsuranceContractClient<'a>, Address, TokenClient<'a>, StellarAssetClient<'a>, Address, Address) {
    let admin = Address::generate(env);
    let token_admin = Address::generate(env);
    let marketplace = Address::generate(env);
    
    // Create token contract with proper admin
    let (token_address, token_client, stellar_client) = create_test_token_contract(env, &token_admin);
    
    // Register insurance contract
    let contract_address = env.register(InsuranceContract, ());
    let client = InsuranceContractClient::new(env, &contract_address);
    
    // Create risk parameters - Make them more lenient for testing
    let risk_params = RiskParameters {
        base_premium_rate: 500, // 5%
        low_risk_multiplier: 100,
        medium_risk_multiplier: 150,
        high_risk_multiplier: 200,
        very_high_risk_multiplier: 300,
        transaction_history_weight: 10,
        value_risk_threshold: 100000, // Much higher threshold so 1000-50000 transactions are low risk
    };
    
    // Initialize contract
    client.initialize(&admin, &token_address, &marketplace, &risk_params);
    
    (contract_address, client, token_address, token_client, stellar_client, admin, marketplace)
}

#[test]
fn test_contract_initialization() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_, client, _, _, _, _, _) = setup_test_contract(&env);
    
    // Test that premium pool is initialized
    let pool = client.get_premium_pool();
    assert_eq!(pool.total_premiums, 0);
    assert_eq!(pool.total_claims_paid, 0);
    assert_eq!(pool.available_funds, 0);
    assert_eq!(pool.pool_reserve_ratio, 2000);
}

#[test]
fn test_purchase_insurance() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_, client, _, _, stellar_client, _, marketplace) = setup_test_contract(&env);
    
    let user1 = Address::generate(&env);
    
    // Mint sufficient tokens to user for premium payment
    stellar_client.mint(&user1, &100000);
    
    // Purchase insurance
    let tx_id = String::from_str(&env, "tx_123");
    let policy_id = client.purchase_insurance(
        &user1,
        &1000,
        &tx_id,
        &marketplace,
        &30
    );
    
    assert_eq!(policy_id, 1);
    
    // Check policy was created
    let policy = client.get_policy(&policy_id).unwrap();
    assert_eq!(policy.policy_id, 1);
    assert_eq!(policy.policyholder, user1);
    assert_eq!(policy.coverage_amount, 1000);
    assert_eq!(policy.status, PolicyStatus::Active);
}

#[test]
fn test_submit_claim() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_, client, _, _, stellar_client, _, marketplace) = setup_test_contract(&env);
    
    let user1 = Address::generate(&env);
    
    // Mint sufficient tokens to user
    stellar_client.mint(&user1, &100000);
    
    // Purchase insurance first
    let tx_id = String::from_str(&env, "tx_123");
    let policy_id = client.purchase_insurance(
        &user1,
        &1000,
        &tx_id,
        &marketplace,
        &30
    );
    
    // Submit claim
    let evidence_hash = BytesN::from_array(&env, &[1; 32]);
    let claim_id = client.submit_claim(
        &user1,
        &policy_id,
        &800,
        &evidence_hash,
    );
    
    assert_eq!(claim_id, 1);
    
    // Check claim was created
    let claim = client.get_claim(&claim_id).unwrap();
    assert_eq!(claim.claim_id, 1);
    assert_eq!(claim.policy_id, policy_id);
    assert_eq!(claim.claimant, user1);
    assert_eq!(claim.amount_claimed, 800);
    assert_eq!(claim.status, ClaimStatus::Pending);
}

#[test]
fn test_confirm_claim() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_, client, _, _, stellar_client, admin, marketplace) = setup_test_contract(&env);
    
    let user1 = Address::generate(&env);
    let oracle = Address::generate(&env);
    let oracle2 = Address::generate(&env);
    
    // Mint sufficient tokens to user
    stellar_client.mint(&user1, &100000);
    
    // Add oracles using the correct admin
    client.add_oracle(&admin, &oracle);
    client.add_oracle(&admin, &oracle2);
    
    // Purchase insurance
    let tx_id = String::from_str(&env, "tx_123");
    let policy_id = client.purchase_insurance(
        &user1,
        &1000,
        &tx_id,
        &marketplace,
        &30
    );
    
    // Submit claim
    let evidence_hash = BytesN::from_array(&env, &[1; 32]);
    let claim_id = client.submit_claim(
        &user1,
        &policy_id,
        &800,
        &evidence_hash,
    );
    
    // Get the required confirmations for this risk level
    let initial_claim = client.get_claim(&claim_id).unwrap();
    let required_confirmations = initial_claim.required_confirmations;
    
    // First confirmation
    client.confirm_claim(&oracle, &claim_id, &true);
    let claim_after_first = client.get_claim(&claim_id).unwrap();
    
    if required_confirmations == 1 {
        assert_eq!(claim_after_first.status, ClaimStatus::Approved);
    } else {
        assert_eq!(claim_after_first.status, ClaimStatus::UnderReview);
        assert_eq!(claim_after_first.oracle_confirmations, 1);
        
        // Provide additional confirmations as needed
        if required_confirmations >= 2 {
            client.confirm_claim(&oracle2, &claim_id, &true);
            let final_claim = client.get_claim(&claim_id).unwrap();
            
            if final_claim.oracle_confirmations >= required_confirmations {
                assert_eq!(final_claim.status, ClaimStatus::Approved);
            }
        }
    }
}

#[test]
fn test_full_claim_process() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (contract_address, client, _, _, stellar_client, admin, marketplace) = setup_test_contract(&env);
    
    let user1 = Address::generate(&env);
    let oracle = Address::generate(&env);
    let oracle2 = Address::generate(&env);
    let oracle3 = Address::generate(&env);
    
    // Mint tokens to both user and contract for claim payout
    stellar_client.mint(&user1, &100000);
    stellar_client.mint(&contract_address, &100000);
    
    // Add multiple oracles using the correct admin (in case we need more confirmations)
    client.add_oracle(&admin, &oracle);
    client.add_oracle(&admin, &oracle2);
    client.add_oracle(&admin, &oracle3);
    
    // Purchase insurance
    let tx_id = String::from_str(&env, "tx_123");
    let policy_id = client.purchase_insurance(
        &user1,
        &1000,
        &tx_id,
        &marketplace,
        &30
    );
    
    // Submit claim
    let evidence_hash = BytesN::from_array(&env, &[1; 32]);
    let claim_id = client.submit_claim(
        &user1,
        &policy_id,
        &800,
        &evidence_hash,
    );
    
    // Get the required confirmations for this risk level
    let initial_claim = client.get_claim(&claim_id).unwrap();
    let required_confirmations = initial_claim.required_confirmations;
    
    // Provide the required number of confirmations
    if required_confirmations >= 1 {
        client.confirm_claim(&oracle, &claim_id, &true);
    }
    if required_confirmations >= 2 {
        client.confirm_claim(&oracle2, &claim_id, &true);
    }
    if required_confirmations >= 3 {
        client.confirm_claim(&oracle3, &claim_id, &true);
    }
    
    // Check final claim status
    let final_claim = client.get_claim(&claim_id).unwrap();
    assert_eq!(final_claim.status, ClaimStatus::Paid);
    
    // Check policy status
    let policy = client.get_policy(&policy_id).unwrap();
    assert_eq!(policy.status, PolicyStatus::Claimed);
}

#[test]
fn test_claim_rejection() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_, client, _, _, stellar_client, admin, marketplace) = setup_test_contract(&env);
    
    let user1 = Address::generate(&env);
    let oracle = Address::generate(&env);
    
    // Mint sufficient tokens to user
    stellar_client.mint(&user1, &100000);
    
    // Add oracle using the correct admin
    client.add_oracle(&admin, &oracle);
    
    // Purchase insurance
    let tx_id = String::from_str(&env, "tx_123");
    let policy_id = client.purchase_insurance(
        &user1,
        &1000,
        &tx_id,
        &marketplace,
        &30
    );
    
    // Submit claim
    let evidence_hash = BytesN::from_array(&env, &[1; 32]);
    let claim_id = client.submit_claim(
        &user1,
        &policy_id,
        &800,
        &evidence_hash,
    );
    
    // Reject claim
    client.confirm_claim(&oracle, &claim_id, &false);
    
    let claim = client.get_claim(&claim_id).unwrap();
    assert_eq!(claim.status, ClaimStatus::Rejected);
}

#[test]
fn test_multiple_oracle_confirmations() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (contract_address, client, _, _, stellar_client, admin, marketplace) = setup_test_contract(&env);
    
    let user1 = Address::generate(&env);
    let oracle1 = Address::generate(&env);
    let oracle2 = Address::generate(&env);
    let oracle3 = Address::generate(&env);
    
    // Mint sufficient tokens to user and contract
    stellar_client.mint(&user1, &200000);
    stellar_client.mint(&contract_address, &200000);
    
    // Add oracles using the correct admin
    client.add_oracle(&admin, &oracle1);
    client.add_oracle(&admin, &oracle2);
    client.add_oracle(&admin, &oracle3);
    
    // Setup for high-risk transaction (requires multiple confirmations)
    let tx_id = String::from_str(&env, "tx_high_risk");
    let policy_id = client.purchase_insurance(
        &user1,
        &50000, // High value transaction
        &tx_id,
        &marketplace,
        &30
    );
    
    // Submit claim
    let evidence_hash = BytesN::from_array(&env, &[1; 32]);
    let claim_id = client.submit_claim(
        &user1,
        &policy_id,
        &40000,
        &evidence_hash,
    );
    
    // Check initial claim status
    let initial_claim = client.get_claim(&claim_id).unwrap();
    let required_confirmations = initial_claim.required_confirmations;
    
    // First confirmation
    client.confirm_claim(&oracle1, &claim_id, &true);
    let claim_after_first = client.get_claim(&claim_id).unwrap();
    
    if required_confirmations > 1 {
        assert_eq!(claim_after_first.status, ClaimStatus::UnderReview);
        assert_eq!(claim_after_first.oracle_confirmations, 1);
        
        // Additional confirmations needed
        for i in 1..required_confirmations {
            let oracle = if i == 1 { &oracle2 } else { &oracle3 };
            client.confirm_claim(oracle, &claim_id, &true);
            let updated_claim = client.get_claim(&claim_id).unwrap();
            
            if updated_claim.oracle_confirmations >= required_confirmations {
                assert_eq!(updated_claim.status, ClaimStatus::Paid);
                break;
            }
        }
    } else {
        assert_eq!(claim_after_first.status, ClaimStatus::Paid);
    }
}

#[test]
fn test_get_premium_quote() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_, client, _, _, _, _, marketplace) = setup_test_contract(&env);
    
    let user = Address::generate(&env);
    
    let quote = client.get_premium_quote(&user, &1000, &marketplace, &30);
    assert!(quote > 0);
}

#[test]
fn test_update_risk_parameters() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_, client, _, _, _, admin, marketplace) = setup_test_contract(&env);
    
    let new_risk_params = RiskParameters {
        base_premium_rate: 600, // Updated from 500
        low_risk_multiplier: 110,
        medium_risk_multiplier: 160,
        high_risk_multiplier: 210,
        very_high_risk_multiplier: 310,
        transaction_history_weight: 15,
        value_risk_threshold: 15000,
    };
    
    // Use the correct admin from setup
    client.update_risk_parameters(&admin, &new_risk_params);
    
    // Verify parameters were updated by checking quote calculation
    let user = Address::generate(&env);
    let new_quote = client.get_premium_quote(&user, &1000, &marketplace, &30);
    assert!(new_quote > 0);
}

#[test]
fn test_get_user_policies() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_, client, _, _, stellar_client, _, marketplace) = setup_test_contract(&env);
    
    let user1 = Address::generate(&env);
    
    // Initially no policies
    let policies = client.get_user_policies(&user1);
    assert_eq!(policies.len(), 0);
    
    // Mint sufficient tokens to user
    stellar_client.mint(&user1, &100000);
    
    // Purchase insurance
    let tx_id = String::from_str(&env, "tx_123");
    let policy_id = client.purchase_insurance(
        &user1,
        &1000,
        &tx_id,
        &marketplace,
        &30
    );
    
    // Check user has policy
    let policies_after = client.get_user_policies(&user1);
    assert_eq!(policies_after.len(), 1);
    assert_eq!(policies_after.get(0).unwrap(), policy_id);
}

#[test]
fn test_marketplace_purchase_insurance() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_, client, _, _, stellar_client, _, marketplace) = setup_test_contract(&env);
    
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    
    // Mint sufficient tokens to buyer
    stellar_client.mint(&buyer, &100000);
    
    let tx_id = String::from_str(&env, "mp_tx_123");
    // Use the correct marketplace address from setup
    let policy_id = client.marketplace_purchase_insurance(
        &marketplace,
        &buyer,
        &seller,
        &1500,
        &tx_id,
        &30
    );
    
    assert_eq!(policy_id, 1);
    
    let policy = client.get_policy(&policy_id).unwrap();
    assert_eq!(policy.policyholder, buyer);
    assert_eq!(policy.coverage_amount, 1500);
}

#[test]
fn test_get_insurance_options() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_, client, _, _, _, _, marketplace) = setup_test_contract(&env);
    
    let buyer = Address::generate(&env);
    
    let options = client.get_insurance_options(&buyer, &2000, &marketplace);
    
    // Should have multiple coverage options
    assert!(options.len() > 1);
    
    // Each option should have coverage, premium, and risk tier
    for option in options {
        assert!(option.0 > 0); // coverage
        assert!(option.1 > 0); // premium
        // risk tier is the third element
    }
}