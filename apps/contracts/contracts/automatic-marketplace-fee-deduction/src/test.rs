#![cfg(test)]

use super::*;
use crate::errors::Error;
use soroban_sdk::{testutils::Address as _, token, Address, Env};

struct TestContext {
    env: Env,
    contract_id: Address,
    token_id: Address,
    marketplace: Address,
    buyer: Address,
    seller: Address,
}

impl TestContext {
    fn new() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(MarketplaceFeeContract, ());

        let marketplace = Address::generate(&env);
        let buyer = Address::generate(&env);
        let seller = Address::generate(&env);

        // Create a token contract using the stellar asset contract
        let token_admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
        let token_id = token_contract.address();
        let stellar_asset_client = token::StellarAssetClient::new(&env, &token_id);

        // Mint tokens to buyer for testing
        stellar_asset_client.mint(&buyer, &10_000_000); // 10M tokens

        Self {
            env,
            contract_id,
            token_id,
            marketplace,
            buyer,
            seller,
        }
    }

    fn get_client(&self) -> MarketplaceFeeContractClient {
        MarketplaceFeeContractClient::new(&self.env, &self.contract_id)
    }

    fn initialize_contract(&self, fee_percentage: u32) {
        let client = self.get_client();
        client.initialize(&fee_percentage, &self.marketplace);
    }

    fn get_token_client(&self) -> token::TokenClient {
        token::TokenClient::new(&self.env, &self.token_id)
    }

    fn get_stellar_asset_client(&self) -> token::StellarAssetClient {
        token::StellarAssetClient::new(&self.env, &self.token_id)
    }
}

#[test]
fn test_contract_initialization() {
    let ctx = TestContext::new();

    // Test successful initialization
    ctx.initialize_contract(250); // 2.5% fee

    let client = ctx.get_client();
    let config = client.get_config();
    assert_eq!(config.fee_percentage, 250);
    assert_eq!(config.fee_recipient, ctx.marketplace);
    assert!(config.is_initialized);
}

#[test]
fn test_initialization_with_invalid_fee() {
    let ctx = TestContext::new();

    // Test initialization with fee percentage > 10%
    let client = ctx.get_client();
    let result = client.try_initialize(&1001, &ctx.marketplace);
    assert_eq!(result, Err(Ok(Error::InvalidFeePercentage)));
}

#[test]
fn test_double_initialization() {
    let ctx = TestContext::new();

    // Initialize once
    ctx.initialize_contract(250);

    // Try to initialize again
    let client = ctx.get_client();
    let result = client.try_initialize(&300, &ctx.marketplace);
    assert_eq!(result, Err(Ok(Error::AlreadyInitialized)));
}

#[test]
fn test_successful_transaction_processing() {
    let ctx = TestContext::new();
    ctx.initialize_contract(250); // 2.5% fee

    let transaction_amount = 10_000i128;

    let token_client = ctx.get_token_client();
    let initial_buyer_balance = token_client.balance(&ctx.buyer);
    let initial_seller_balance = token_client.balance(&ctx.seller);
    let initial_marketplace_balance = token_client.balance(&ctx.marketplace);

    let client = ctx.get_client();
    let result =
        client.process_transaction(&ctx.buyer, &ctx.seller, &transaction_amount, &ctx.token_id);

    let transaction_details = result;
    assert_eq!(transaction_details.total_amount, transaction_amount);
    assert_eq!(transaction_details.fee_amount, 250); // 2.5% of 10,000
    assert_eq!(transaction_details.seller_amount, 9_750); // 10,000 - 250
    assert_eq!(transaction_details.buyer, ctx.buyer);
    assert_eq!(transaction_details.seller, ctx.seller);
    assert_eq!(transaction_details.token, ctx.token_id);

    // Check final balances
    let final_buyer_balance = token_client.balance(&ctx.buyer);
    let final_seller_balance = token_client.balance(&ctx.seller);
    let final_marketplace_balance = token_client.balance(&ctx.marketplace);

    assert_eq!(
        final_buyer_balance,
        initial_buyer_balance - transaction_amount
    );
    assert_eq!(final_seller_balance, initial_seller_balance + 9_750);
    assert_eq!(final_marketplace_balance, initial_marketplace_balance + 250);
}

#[test]
fn test_transaction_processing_not_initialized() {
    let ctx = TestContext::new();
    // Don't initialize the contract

    let client = ctx.get_client();
    let result =
        client.try_process_transaction(&ctx.buyer, &ctx.seller, &10_000i128, &ctx.token_id);

    assert_eq!(result, Err(Ok(Error::NotInitialized)));
}

#[test]
fn test_transaction_with_invalid_amount() {
    let ctx = TestContext::new();
    ctx.initialize_contract(250);

    // Test with zero amount
    let client = ctx.get_client();
    let result = client.try_process_transaction(&ctx.buyer, &ctx.seller, &0i128, &ctx.token_id);
    assert_eq!(result, Err(Ok(Error::InvalidAmount)));

    // Test with negative amount
    let result = client.try_process_transaction(&ctx.buyer, &ctx.seller, &-100i128, &ctx.token_id);
    assert_eq!(result, Err(Ok(Error::InvalidAmount)));
}

#[test]
fn test_transaction_with_insufficient_funds() {
    let ctx = TestContext::new();
    ctx.initialize_contract(250);

    // Create a buyer with insufficient funds
    let poor_buyer = Address::generate(&ctx.env);
    let stellar_asset_client = ctx.get_stellar_asset_client();
    stellar_asset_client.mint(&poor_buyer, &100); // Only 100 tokens

    // Try to spend more than available
    let client = ctx.get_client();
    let result = client.try_process_transaction(&poor_buyer, &ctx.seller, &1000i128, &ctx.token_id);

    // This should fail at the token transfer level
    assert!(result.is_err());
}

#[test]
fn test_fee_calculation() {
    let ctx = TestContext::new();
    ctx.initialize_contract(250); // 2.5%

    let client = ctx.get_client();
    let (fee_amount, seller_amount) = client.calculate_fee(&10_000i128);
    assert_eq!(fee_amount, 250);
    assert_eq!(seller_amount, 9_750);

    // Test with different amounts
    let (fee_amount, seller_amount) = client.calculate_fee(&1_000_000i128);
    assert_eq!(fee_amount, 25_000); // 2.5% of 1M
    assert_eq!(seller_amount, 975_000);
}

#[test]
fn test_fee_calculation_not_initialized() {
    let ctx = TestContext::new();

    let client = ctx.get_client();
    let result = client.try_calculate_fee(&10_000i128);
    assert_eq!(result, Err(Ok(Error::NotInitialized)));
}

#[test]
fn test_fee_calculation_invalid_amount() {
    let ctx = TestContext::new();
    ctx.initialize_contract(250);

    let client = ctx.get_client();
    let result = client.try_calculate_fee(&0i128);
    assert_eq!(result, Err(Ok(Error::InvalidAmount)));

    let result = client.try_calculate_fee(&-100i128);
    assert_eq!(result, Err(Ok(Error::InvalidAmount)));
}

#[test]
fn test_update_fee_percentage() {
    let ctx = TestContext::new();
    ctx.initialize_contract(250);

    // Update fee percentage
    let client = ctx.get_client();
    client.update_fee_percentage(&500); // 5%

    let config = client.get_config();
    assert_eq!(config.fee_percentage, 500);

    // Test fee calculation with new percentage
    let (fee_amount, seller_amount) = client.calculate_fee(&10_000i128);
    assert_eq!(fee_amount, 500); // 5% of 10,000
    assert_eq!(seller_amount, 9_500);
}

#[test]
fn test_update_fee_percentage_invalid() {
    let ctx = TestContext::new();
    ctx.initialize_contract(250);

    // Try to set fee > 10%
    let client = ctx.get_client();
    let result = client.try_update_fee_percentage(&1001);
    assert_eq!(result, Err(Ok(Error::InvalidFeePercentage)));
}

#[test]
fn test_update_fee_percentage_not_initialized() {
    let ctx = TestContext::new();

    let client = ctx.get_client();
    let result = client.try_update_fee_percentage(&500);
    assert_eq!(result, Err(Ok(Error::NotInitialized)));
}

#[test]
fn test_get_config_not_initialized() {
    let ctx = TestContext::new();

    let client = ctx.get_client();
    let result = client.try_get_config();
    assert_eq!(result, Err(Ok(Error::NotInitialized)));
}

#[test]
fn test_edge_case_very_small_amounts() {
    let ctx = TestContext::new();
    ctx.initialize_contract(250); // 2.5%

    // Test with amount = 1 (should result in 0 fee due to rounding)
    let client = ctx.get_client();
    let (fee_amount, seller_amount) = client.calculate_fee(&1i128);
    assert_eq!(fee_amount, 0); // 1 * 250 / 10000 = 0 (rounded down)
    assert_eq!(seller_amount, 1);

    // Test with amount = 100 (should result in 0 fee due to rounding)
    let (fee_amount, seller_amount) = client.calculate_fee(&100i128);
    assert_eq!(fee_amount, 2); // 100 * 250 / 10000 = 2
    assert_eq!(seller_amount, 98);
}

#[test]
fn test_edge_case_maximum_fee_percentage() {
    let ctx = TestContext::new();
    ctx.initialize_contract(1000); // 10% (maximum allowed)

    let client = ctx.get_client();
    let (fee_amount, seller_amount) = client.calculate_fee(&10_000i128);
    assert_eq!(fee_amount, 1_000); // 10% of 10,000
    assert_eq!(seller_amount, 9_000);
}

#[test]
fn test_edge_case_zero_fee_percentage() {
    let ctx = TestContext::new();
    ctx.initialize_contract(0); // 0% fee

    let client = ctx.get_client();
    let (fee_amount, seller_amount) = client.calculate_fee(&10_000i128);
    assert_eq!(fee_amount, 0);
    assert_eq!(seller_amount, 10_000);

    // Process actual transaction with 0% fee
    let client = ctx.get_client();
    let result = client.process_transaction(&ctx.buyer, &ctx.seller, &10_000i128, &ctx.token_id);

    assert_eq!(result.fee_amount, 0);
    assert_eq!(result.seller_amount, 10_000);
}

#[test]
fn test_multiple_transactions() {
    let ctx = TestContext::new();
    ctx.initialize_contract(250); // 2.5%

    let token_client = ctx.get_token_client();
    let initial_marketplace_balance = token_client.balance(&ctx.marketplace);

    // Process multiple transactions
    for i in 1..=5 {
        let amount = 1_000i128 * i;
        let client = ctx.get_client();
        client.process_transaction(&ctx.buyer, &ctx.seller, &amount, &ctx.token_id);
    }

    // Total amount transacted: 1000 + 2000 + 3000 + 4000 + 5000 = 15,000
    // Total fees: 25 + 50 + 75 + 100 + 125 = 375
    let final_marketplace_balance = token_client.balance(&ctx.marketplace);
    let total_fees_collected = final_marketplace_balance - initial_marketplace_balance;

    assert_eq!(total_fees_collected, 375);
}
