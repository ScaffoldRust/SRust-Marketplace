#![cfg(test)]

use super::*;
use crate::{error::ContractError, storage::TransactionStatus};
use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    token, Address, Env,
};
use token::StellarAssetClient as TokenAdminClient;

fn create_token_contract<'a>(
    env: &Env,
    admin: &Address,
) -> (token::Client<'a>, TokenAdminClient<'a>) {
    let token_address = env
        .register_stellar_asset_contract_v2(admin.clone())
        .address();
    (
        token::Client::new(env, &token_address),
        TokenAdminClient::new(env, &token_address),
    )
}

struct DepositTest<'a> {
    env: Env,
    contract: PartialPaymentContractClient<'a>,
    token: token::Client<'a>,
    seller: Address,
    buyer: Address,
}

impl<'a> DepositTest<'a> {
    fn setup() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        // Accounts
        let seller = Address::generate(&env);
        let buyer = Address::generate(&env);

        // Token Contract
        let (token_client, token_admin_client) = create_token_contract(&env, &seller);

        // Main Deposit Contract
        let contract_id = env.register(PartialPaymentContract, ());
        let contract = PartialPaymentContractClient::new(&env, &contract_id);

        // Fund buyer
        token_admin_client.mint(&buyer, &10000);

        DepositTest {
            env,
            contract,
            token: token_client,
            seller,
            buyer,
        }
    }
}

// --- Tests ---

#[test]
fn test_start_transaction() {
    let test = DepositTest::setup();
    let deadline = test.env.ledger().timestamp() + 3600;

    let tx_id = test.contract.start_transaction(
        &test.buyer,
        &test.seller,
        &1000, // total_amount
        &test.token.address,
        &deadline,
    );

    assert_eq!(tx_id, 1);

    let tx = test.contract.get_transaction(&tx_id);
    assert_eq!(tx.buyer, test.buyer);
    assert_eq!(tx.seller, test.seller);
    assert_eq!(tx.total_amount, 1000);
    assert_eq!(tx.deposited_amount, 0);
    assert_eq!(tx.status, TransactionStatus::Active);
}

#[test]
fn test_make_partial_and_full_deposit() {
    let test = DepositTest::setup();
    let deadline = test.env.ledger().timestamp() + 3600;
    let tx_id = test.contract.start_transaction(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &deadline,
    );

    // First partial deposit
    test.contract.make_deposit(&test.buyer, &tx_id, &400);
    let tx1 = test.contract.get_transaction(&tx_id);
    assert_eq!(tx1.deposited_amount, 400);
    assert_eq!(tx1.status, TransactionStatus::Active);
    assert_eq!(test.token.balance(&test.contract.address), 400);

    // Second deposit to reach full amount
    test.contract.make_deposit(&test.buyer, &tx_id, &600);
    let tx2 = test.contract.get_transaction(&tx_id);
    assert_eq!(tx2.deposited_amount, 1000);
    assert_eq!(tx2.status, TransactionStatus::Funded); // Status changes to Funded
    assert_eq!(test.token.balance(&test.contract.address), 1000);
}

#[test]
fn test_claim_payment() {
    let test = DepositTest::setup();
    let deadline = test.env.ledger().timestamp() + 3600;
    let tx_id = test.contract.start_transaction(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &deadline,
    );
    test.contract.make_deposit(&test.buyer, &tx_id, &1000);

    // Seller claims payment
    test.contract.claim_payment(&test.seller, &tx_id);

    let tx = test.contract.get_transaction(&tx_id);
    assert_eq!(tx.status, TransactionStatus::Completed);

    // Check balances
    assert_eq!(test.token.balance(&test.seller), 1000);
    assert_eq!(test.token.balance(&test.contract.address), 0);
    assert_eq!(test.token.balance(&test.buyer), 9000);
}

#[test]
fn test_claim_payment_errors() {
    let test = DepositTest::setup();
    let deadline = test.env.ledger().timestamp() + 3600;
    let tx_id = test.contract.start_transaction(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &deadline,
    );
    test.contract.make_deposit(&test.buyer, &tx_id, &500);

    // Try to claim before fully funded
    let result1 = test.contract.try_claim_payment(&test.seller, &tx_id);
    assert_eq!(result1, Err(Ok(ContractError::TransactionNotFundedEnough)));

    // Try to claim as non-seller
    let result2 = test.contract.try_claim_payment(&test.buyer, &tx_id);
    assert_eq!(result2, Err(Ok(ContractError::NotSeller)));
}

#[test]
fn test_request_refund_after_deadline() {
    let test = DepositTest::setup();
    let deadline = test.env.ledger().timestamp() + 10;
    let tx_id = test.contract.start_transaction(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &deadline,
    );
    test.contract.make_deposit(&test.buyer, &tx_id, &300);

    // Advance time past the deadline
    test.env.ledger().with_mut(|l| l.timestamp += 20);

    // Buyer requests refund
    test.contract.request_refund(&test.buyer, &tx_id);

    let tx = test.contract.get_transaction(&tx_id);
    assert_eq!(tx.status, TransactionStatus::Expired);

    // Check balances
    assert_eq!(test.token.balance(&test.buyer), 10000); // Full refund
    assert_eq!(test.token.balance(&test.contract.address), 0);
}

#[test]
fn test_request_refund_errors() {
    let test = DepositTest::setup();
    let deadline = test.env.ledger().timestamp() + 3600;
    let tx_id = test.contract.start_transaction(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &deadline,
    );
    test.contract.make_deposit(&test.buyer, &tx_id, &300);

    // Try to refund before deadline
    let result1 = test.contract.try_request_refund(&test.buyer, &tx_id);
    assert_eq!(result1, Err(Ok(ContractError::DeadlineNotPassed)));

    // Fully fund the transaction
    test.contract.make_deposit(&test.buyer, &tx_id, &700);

    // Advance time past the deadline
    test.env.ledger().with_mut(|l| l.timestamp = deadline + 10);

    // Try to refund a fully funded transaction
    let result2 = test.contract.try_request_refund(&test.buyer, &tx_id);
    assert_eq!(result2, Err(Ok(ContractError::TransactionFullyFunded)));
}

#[test]
fn test_cancel_transaction() {
    let test = DepositTest::setup();
    let deadline = test.env.ledger().timestamp() + 3600;
    let tx_id = test.contract.start_transaction(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &deadline,
    );
    test.contract.make_deposit(&test.buyer, &tx_id, &200);

    // Seller cancels
    test.contract.cancel_transaction(&test.seller, &tx_id);

    let tx = test.contract.get_transaction(&tx_id);
    assert_eq!(tx.status, TransactionStatus::Cancelled);

    // Check that buyer was refunded
    assert_eq!(test.token.balance(&test.buyer), 10000);
    assert_eq!(test.token.balance(&test.contract.address), 0);
}
