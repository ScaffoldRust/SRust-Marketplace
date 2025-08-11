#![cfg(test)]

use crate::{
    error::ContractError,
    types::{ConsensusRule, TransactionStatus},
    ConsensusReleaseContract, ConsensusReleaseContractClient,
};
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token, Address, Env, String,
};

fn create_token_contract<'a>(env: &Env, admin: &Address) -> (token::Client<'a>, token::StellarAssetClient<'a>) {
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    (
        token::Client::new(env, &sac.address()),
        token::StellarAssetClient::new(env, &sac.address()),
    )
}

struct TestContext {
    env: Env,
    admin: Address,
    buyer: Address,
    seller: Address,
    arbitrator: Address,
    token: token::Client<'static>,
    token_admin: token::StellarAssetClient<'static>,
    contract: ConsensusReleaseContractClient<'static>,
}

impl TestContext {
    fn new() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let buyer = Address::generate(&env);
        let seller = Address::generate(&env);
        let arbitrator = Address::generate(&env);

        let (token, token_admin) = create_token_contract(&env, &admin);
        token_admin.mint(&buyer, &1000);

        let contract_address = env.register_contract(None, ConsensusReleaseContract);
        let contract = ConsensusReleaseContractClient::new(&env, &contract_address);

        // Initialize contract
        contract.initialize(&admin);

        Self {
            env,
            admin,
            buyer,
            seller,
            arbitrator,
            token,
            token_admin,
            contract,
        }
    }

    fn advance_time(&self, seconds: u64) {
        self.env.ledger().with_mut(|info| {
            info.timestamp += seconds;
        });
    }
}

#[test]
fn test_initialization() {
    let ctx = TestContext::new();

    // Test successful initialization
    assert_eq!(ctx.contract.get_admin(), ctx.admin);

    // Test double initialization fails
    let result = ctx.contract.try_initialize(&ctx.admin);
    assert_eq!(result, Err(Ok(ContractError::AlreadyInitialized)));
}

#[test]
fn test_create_transaction_success() {
    let ctx = TestContext::new();

    let transaction_id = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &Some(ctx.arbitrator.clone()),
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::Unanimous,
        &3600, // 1 hour
    );

    assert_eq!(transaction_id, 1);

    let transaction = ctx.contract.get_transaction(&transaction_id);
    assert_eq!(transaction.buyer, ctx.buyer);
    assert_eq!(transaction.seller, ctx.seller);
    assert_eq!(transaction.arbitrator, Some(ctx.arbitrator.clone()));
    assert_eq!(transaction.amount, 100);
    assert_eq!(transaction.status, TransactionStatus::Created);
}

#[test]
fn test_create_transaction_validation() {
    let ctx = TestContext::new();

    // Test invalid amount
    let result = ctx.contract.try_create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &None,
        &ctx.token.address,
        &0, // Invalid amount
        &String::from_str(&ctx.env, "Test"),
        &ConsensusRule::BuyerSellerOnly,
        &3600,
    );
    assert_eq!(result, Err(Ok(ContractError::InvalidAmount)));

    // Test duplicate parties
    let result = ctx.contract.try_create_transaction(
        &ctx.buyer,
        &ctx.buyer, // Same as buyer
        &None,
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test"),
        &ConsensusRule::BuyerSellerOnly,
        &3600,
    );
    assert_eq!(result, Err(Ok(ContractError::DuplicateParties)));

    // Test arbitrator required for WithArbitrator rule
    let result = ctx.contract.try_create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &None, // No arbitrator
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test"),
        &ConsensusRule::WithArbitrator,
        &3600,
    );
    assert_eq!(result, Err(Ok(ContractError::ArbitratorRequired)));
}

#[test]
fn test_fund_transaction_success() {
    let ctx = TestContext::new();

    let transaction_id = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &None,
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::BuyerSellerOnly,
        &3600,
    );

    ctx.contract.fund_transaction(&ctx.buyer, &transaction_id);

    let transaction = ctx.contract.get_transaction(&transaction_id);
    assert_eq!(transaction.status, TransactionStatus::Funded);
    assert_eq!(ctx.token.balance(&ctx.buyer), 900);
    assert_eq!(ctx.token.balance(&ctx.contract.address), 100);
}

#[test]
fn test_fund_transaction_validation() {
    let ctx = TestContext::new();

    let transaction_id = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &None,
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::BuyerSellerOnly,
        &3600,
    );

    // Test unauthorized funding
    let result = ctx.contract.try_fund_transaction(&ctx.seller, &transaction_id);
    assert_eq!(result, Err(Ok(ContractError::NotAuthorized)));

    // Fund successfully first time
    ctx.contract.fund_transaction(&ctx.buyer, &transaction_id);

    // Test double funding
    let result = ctx.contract.try_fund_transaction(&ctx.buyer, &transaction_id);
    assert_eq!(result, Err(Ok(ContractError::TransactionAlreadyFunded)));
}

#[test]
fn test_unanimous_consensus_success() {
    let ctx = TestContext::new();

    let transaction_id = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &Some(ctx.arbitrator.clone()),
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::Unanimous,
        &3600,
    );

    ctx.contract.fund_transaction(&ctx.buyer, &transaction_id);

    // All parties agree
    ctx.contract.submit_agreement(
        &ctx.buyer,
        &transaction_id,
        &true,
        &Some(String::from_str(&ctx.env, "Buyer agrees")),
    );

    ctx.contract.submit_agreement(
        &ctx.seller,
        &transaction_id,
        &true,
        &Some(String::from_str(&ctx.env, "Seller agrees")),
    );

    ctx.contract.submit_agreement(
        &ctx.arbitrator,
        &transaction_id,
        &true,
        &Some(String::from_str(&ctx.env, "Arbitrator agrees")),
    );

    let transaction = ctx.contract.get_transaction(&transaction_id);
    assert_eq!(transaction.status, TransactionStatus::ConsensusReached);

    // Release funds
    ctx.contract.release_funds(&ctx.buyer, &transaction_id);

    let transaction = ctx.contract.get_transaction(&transaction_id);
    assert_eq!(transaction.status, TransactionStatus::Released);
    assert_eq!(ctx.token.balance(&ctx.seller), 100);
    assert_eq!(ctx.token.balance(&ctx.contract.address), 0);
}

#[test]
fn test_majority_consensus_success() {
    let ctx = TestContext::new();

    let transaction_id = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &Some(ctx.arbitrator.clone()),
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::Majority,
        &3600,
    );

    ctx.contract.fund_transaction(&ctx.buyer, &transaction_id);

    // Two out of three parties agree (majority)
    ctx.contract.submit_agreement(&ctx.buyer, &transaction_id, &true, &None);
    ctx.contract.submit_agreement(&ctx.seller, &transaction_id, &true, &None);

    let transaction = ctx.contract.get_transaction(&transaction_id);
    assert_eq!(transaction.status, TransactionStatus::ConsensusReached);
}

#[test]
fn test_buyer_seller_only_consensus() {
    let ctx = TestContext::new();

    let transaction_id = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &Some(ctx.arbitrator.clone()),
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::BuyerSellerOnly,
        &3600,
    );

    ctx.contract.fund_transaction(&ctx.buyer, &transaction_id);

    // Only buyer and seller need to agree
    ctx.contract.submit_agreement(&ctx.buyer, &transaction_id, &true, &None);
    ctx.contract.submit_agreement(&ctx.seller, &transaction_id, &true, &None);

    let transaction = ctx.contract.get_transaction(&transaction_id);
    assert_eq!(transaction.status, TransactionStatus::ConsensusReached);
}

#[test]
fn test_consensus_rejection() {
    let ctx = TestContext::new();

    let transaction_id = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &None,
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::BuyerSellerOnly,
        &3600,
    );

    ctx.contract.fund_transaction(&ctx.buyer, &transaction_id);

    // Seller rejects
    ctx.contract.submit_agreement(
        &ctx.seller,
        &transaction_id,
        &false,
        &Some(String::from_str(&ctx.env, "Quality issues")),
    );

    let transaction = ctx.contract.get_transaction(&transaction_id);
    assert_eq!(transaction.status, TransactionStatus::Refunded);
    assert_eq!(ctx.token.balance(&ctx.buyer), 1000); // Refunded
    assert_eq!(ctx.token.balance(&ctx.contract.address), 0);
}

#[test]
fn test_agreement_validation() {
    let ctx = TestContext::new();

    let transaction_id = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &None,
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::BuyerSellerOnly,
        &3600,
    );

    ctx.contract.fund_transaction(&ctx.buyer, &transaction_id);

    // Test unauthorized party
    let unauthorized = Address::generate(&ctx.env);
    let result = ctx.contract.try_submit_agreement(&unauthorized, &transaction_id, &true, &None);
    assert_eq!(result, Err(Ok(ContractError::NotAuthorizedParty)));

    // Submit agreement
    ctx.contract.submit_agreement(&ctx.buyer, &transaction_id, &true, &None);

    // Test duplicate agreement
    let result = ctx.contract.try_submit_agreement(&ctx.buyer, &transaction_id, &true, &None);
    assert_eq!(result, Err(Ok(ContractError::AgreementAlreadySubmitted)));
}

#[test]
fn test_release_funds_validation() {
    let ctx = TestContext::new();

    let transaction_id = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &None,
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::BuyerSellerOnly,
        &3600,
    );

    ctx.contract.fund_transaction(&ctx.buyer, &transaction_id);

    // Test release without consensus
    let result = ctx.contract.try_release_funds(&ctx.buyer, &transaction_id);
    assert_eq!(result, Err(Ok(ContractError::ConsensusNotReached)));

    // Achieve consensus but don't release yet
    ctx.contract.submit_agreement(&ctx.buyer, &transaction_id, &true, &None);
    ctx.contract.submit_agreement(&ctx.seller, &transaction_id, &true, &None);

    // Test unauthorized release
    let unauthorized = Address::generate(&ctx.env);
    let result = ctx.contract.try_release_funds(&unauthorized, &transaction_id);
    assert_eq!(result, Err(Ok(ContractError::NotAuthorized)));

    // Successful release
    ctx.contract.release_funds(&ctx.buyer, &transaction_id);

    // Test duplicate release
    let result = ctx.contract.try_release_funds(&ctx.buyer, &transaction_id);
    assert_eq!(result, Err(Ok(ContractError::ConsensusNotReached)));
}

#[test]
fn test_transaction_expiration() {
    let ctx = TestContext::new();

    let transaction_id = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &None,
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::BuyerSellerOnly,
        &3600, // 1 hour
    );

    ctx.contract.fund_transaction(&ctx.buyer, &transaction_id);

    // Advance time past deadline
    ctx.advance_time(3601);

    // Try to submit agreement after expiration
    let result = ctx.contract.try_submit_agreement(&ctx.buyer, &transaction_id, &true, &None);
    assert_eq!(result, Err(Ok(ContractError::TransactionExpired)));

    // Handle expiration should refund
    ctx.contract.handle_expiration(&transaction_id);

    let transaction = ctx.contract.get_transaction(&transaction_id);
    assert_eq!(transaction.status, TransactionStatus::Refunded);
    assert_eq!(ctx.token.balance(&ctx.buyer), 1000); // Refunded
}

#[test]
fn test_expiration_before_funding() {
    let ctx = TestContext::new();

    let transaction_id = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &None,
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::BuyerSellerOnly,
        &3600, // 1 hour
    );

    // Advance time past deadline
    ctx.advance_time(3601);

    // Try to fund after expiration
    let result = ctx.contract.try_fund_transaction(&ctx.buyer, &transaction_id);
    assert_eq!(result, Err(Ok(ContractError::TransactionExpired)));
}

#[test]
fn test_get_user_transactions() {
    let ctx = TestContext::new();

    let tx1 = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &None,
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Transaction 1"),
        &ConsensusRule::BuyerSellerOnly,
        &3600,
    );

    let tx2 = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &None,
        &ctx.token.address,
        &200,
        &String::from_str(&ctx.env, "Transaction 2"),
        &ConsensusRule::BuyerSellerOnly,
        &3600,
    );

    let buyer_transactions = ctx.contract.get_user_transactions(&ctx.buyer);
    assert_eq!(buyer_transactions.len(), 2);
    assert!(buyer_transactions.contains(tx1));
    assert!(buyer_transactions.contains(tx2));

    let seller_transactions = ctx.contract.get_user_transactions(&ctx.seller);
    assert_eq!(seller_transactions.len(), 2);
    assert!(seller_transactions.contains(tx1));
    assert!(seller_transactions.contains(tx2));
}

#[test]
fn test_admin_management() {
    let ctx = TestContext::new();
    let new_admin = Address::generate(&ctx.env);

    // Test set admin by current admin
    ctx.contract.set_admin(&ctx.admin, &new_admin);
    assert_eq!(ctx.contract.get_admin(), new_admin);

    // Test unauthorized admin change
    let result = ctx.contract.try_set_admin(&ctx.admin, &ctx.buyer);
    assert_eq!(result, Err(Ok(ContractError::NotAuthorized)));
}

#[test]
fn test_transaction_counter() {
    let ctx = TestContext::new();

    assert_eq!(ctx.contract.get_transaction_counter(), 0);

    ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &None,
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::BuyerSellerOnly,
        &3600,
    );

    assert_eq!(ctx.contract.get_transaction_counter(), 1);
}

#[test]
fn test_with_arbitrator_rule() {
    let ctx = TestContext::new();

    let transaction_id = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &Some(ctx.arbitrator.clone()),
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::WithArbitrator,
        &3600,
    );

    ctx.contract.fund_transaction(&ctx.buyer, &transaction_id);

    // Buyer and seller agree, but arbitrator is required
    ctx.contract.submit_agreement(&ctx.buyer, &transaction_id, &true, &None);
    ctx.contract.submit_agreement(&ctx.seller, &transaction_id, &true, &None);

    let transaction = ctx.contract.get_transaction(&transaction_id);
    assert_eq!(transaction.status, TransactionStatus::Funded); // Not yet consensus

    // Arbitrator agrees
    ctx.contract.submit_agreement(&ctx.arbitrator, &transaction_id, &true, &None);

    let transaction = ctx.contract.get_transaction(&transaction_id);
    assert_eq!(transaction.status, TransactionStatus::ConsensusReached);
}

#[test]
fn test_invalid_transaction_id() {
    let ctx = TestContext::new();

    let result = ctx.contract.try_get_transaction(&999);
    assert_eq!(result, Err(Ok(ContractError::TransactionNotFound)));

    let result = ctx.contract.try_fund_transaction(&ctx.buyer, &999);
    assert_eq!(result, Err(Ok(ContractError::TransactionNotFound)));
}

#[test]
fn test_edge_case_same_timestamp() {
    let ctx = TestContext::new();

    // Create transaction with very short deadline
    let transaction_id = ctx.contract.create_transaction(
        &ctx.buyer,
        &ctx.seller,
        &None,
        &ctx.token.address,
        &100,
        &String::from_str(&ctx.env, "Test transaction"),
        &ConsensusRule::BuyerSellerOnly,
        &1, // 1 second
    );

    ctx.contract.fund_transaction(&ctx.buyer, &transaction_id);

    // Should still be able to submit agreements immediately
    ctx.contract.submit_agreement(&ctx.buyer, &transaction_id, &true, &None);
    ctx.contract.submit_agreement(&ctx.seller, &transaction_id, &true, &None);

    let transaction = ctx.contract.get_transaction(&transaction_id);
    assert_eq!(transaction.status, TransactionStatus::ConsensusReached);
}