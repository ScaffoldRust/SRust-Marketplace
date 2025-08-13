#![cfg(test)]

use super::*;
use crate::{error::ContractError, storage::EscrowStatus};
use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    token, Address, Env, IntoVal, String,
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

struct EscrowTest<'a> {
    env: Env,
    contract: AutoReleaseEscrowContractClient<'a>,
    token: token::Client<'a>,
    admin: Address,
    seller: Address,
    buyer: Address,
}

impl<'a> EscrowTest<'a> {
    fn setup() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        // Accounts
        let admin = Address::generate(&env);
        let seller = Address::generate(&env);
        let buyer = Address::generate(&env);

        // Token Contract
        let (token_client, token_admin_client) = create_token_contract(&env, &admin);

        // Main Escrow Contract
        let contract_id = env.register(AutoReleaseEscrowContract, ());
        let contract = AutoReleaseEscrowContractClient::new(&env, &contract_id);

        // Fund buyer
        token_admin_client.mint(&buyer, &10000);

        // Initialize the contract with a dedicated admin.
        contract.initialize(&admin);

        EscrowTest {
            env,
            contract,
            token: token_client,
            admin,
            seller,
            buyer,
        }
    }
}

// --- Tests ---

#[test]
fn test_initialize() {
    let test = EscrowTest::setup();
    // Try to initialize again, should fail.
    let result = test.contract.try_initialize(&test.admin);
    assert_eq!(result, Err(Ok(ContractError::AlreadyInitialized)));
}

#[test]
fn test_set_admin() {
    let test = EscrowTest::setup();
    let new_admin = Address::generate(&test.env);

    // Current admin sets a new admin
    test.contract.set_admin(&test.admin, &new_admin);

    // Verify the new admin can perform admin actions, like resolving a dispute
    let escrow_id = test.contract.create_escrow(
        &test.buyer,
        &test.seller,
        &100,
        &test.token.address,
        &(test.env.ledger().timestamp() + 100),
    );
    test.contract
        .dispute_escrow(&test.buyer, &escrow_id, &"reason".into_val(&test.env));

    // The new admin should now be able to resolve it
    test.contract
        .resolve_dispute_and_refund(&new_admin, &escrow_id);
    let escrow = test.contract.get_escrow(&escrow_id);
    assert_eq!(escrow.status, EscrowStatus::Refunded);
}

#[test]
fn test_set_admin_unauthorized() {
    let test = EscrowTest::setup();
    let new_admin = Address::generate(&test.env);

    // A non-admin (the seller) tries to set a new admin
    let result = test.contract.try_set_admin(&test.seller, &new_admin);
    assert_eq!(result, Err(Ok(ContractError::NotAdmin)));
}

#[test]
fn test_create_escrow_and_fund_locking() {
    let test = EscrowTest::setup();
    let release_timestamp = test.env.ledger().timestamp() + 3600;

    let escrow_id = test.contract.create_escrow(
        &test.buyer,
        &test.seller,
        &1000, // amount
        &test.token.address,
        &release_timestamp,
    );

    assert_eq!(escrow_id, 1);

    let escrow = test.contract.get_escrow(&escrow_id);
    assert_eq!(escrow.buyer, test.buyer);
    assert_eq!(escrow.seller, test.seller);
    assert_eq!(escrow.amount, 1000);
    assert_eq!(escrow.status, EscrowStatus::Active);
    assert_eq!(escrow.buyer_confirmed, false);

    // Check that funds are locked in the contract
    assert_eq!(test.token.balance(&test.buyer), 9000);
    assert_eq!(test.token.balance(&test.contract.address), 1000);
}

#[test]
fn test_release_funds_after_time_elapses() {
    let test = EscrowTest::setup();
    let release_timestamp = test.env.ledger().timestamp() + 10;
    let escrow_id = test.contract.create_escrow(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &release_timestamp,
    );

    // Advance time past the release timestamp
    test.env.ledger().with_mut(|l| l.timestamp += 20);

    test.contract.release_funds(&escrow_id);

    let escrow = test.contract.get_escrow(&escrow_id);
    assert_eq!(escrow.status, EscrowStatus::Released);

    // Check that funds were transferred to the seller
    assert_eq!(test.token.balance(&test.seller), 1000);
    assert_eq!(test.token.balance(&test.contract.address), 0);
}

#[test]
fn test_confirm_receipt_and_early_release() {
    let test = EscrowTest::setup();
    let release_timestamp = test.env.ledger().timestamp() + 3600; // 1 hour
    let escrow_id = test.contract.create_escrow(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &release_timestamp,
    );

    // Buyer confirms receipt
    test.contract.confirm_receipt(&test.buyer, &escrow_id);

    let escrow_after_confirm = test.contract.get_escrow(&escrow_id);
    assert_eq!(escrow_after_confirm.buyer_confirmed, true);

    // Release should now succeed, even though the time has not passed
    test.contract.release_funds(&escrow_id);

    let escrow_after_release = test.contract.get_escrow(&escrow_id);
    assert_eq!(escrow_after_release.status, EscrowStatus::Released);
    assert_eq!(test.token.balance(&test.seller), 1000);
}

#[test]
fn test_dispute_and_admin_refund() {
    let test = EscrowTest::setup();
    let release_timestamp = test.env.ledger().timestamp() + 3600;
    let escrow_id = test.contract.create_escrow(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &release_timestamp,
    );

    // Buyer disputes the escrow
    let reason = String::from_str(&test.env, "Item not as described");
    test.contract
        .dispute_escrow(&test.buyer, &escrow_id, &reason);

    let escrow_after_dispute = test.contract.get_escrow(&escrow_id);
    assert_eq!(escrow_after_dispute.status, EscrowStatus::Disputed);
    assert_eq!(escrow_after_dispute.dispute_reason, Some(reason));

    // Admin resolves the dispute and refunds the buyer
    test.contract
        .resolve_dispute_and_refund(&test.admin, &escrow_id);

    let escrow_after_refund = test.contract.get_escrow(&escrow_id);
    assert_eq!(escrow_after_refund.status, EscrowStatus::Refunded);

    // Check that funds were returned to the buyer
    assert_eq!(test.token.balance(&test.buyer), 10000);
    assert_eq!(test.token.balance(&test.contract.address), 0);
}

#[test]
fn test_release_fails_before_time() {
    let test = EscrowTest::setup();
    let release_timestamp = test.env.ledger().timestamp() + 3600;
    let escrow_id = test.contract.create_escrow(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &release_timestamp,
    );

    let result = test.contract.try_release_funds(&escrow_id);
    assert_eq!(result, Err(Ok(ContractError::ReleaseTimeNotPassed)));
}

#[test]
fn test_release_fails_if_disputed() {
    let test = EscrowTest::setup();
    let release_timestamp = test.env.ledger().timestamp() + 3600;
    let escrow_id = test.contract.create_escrow(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &release_timestamp,
    );
    test.contract
        .dispute_escrow(&test.buyer, &escrow_id, &"reason".into_val(&test.env));

    let result = test.contract.try_release_funds(&escrow_id);
    assert_eq!(result, Err(Ok(ContractError::EscrowNotActive)));
}

#[test]
fn test_dispute_fails_if_not_buyer() {
    let test = EscrowTest::setup();
    let release_timestamp = test.env.ledger().timestamp() + 3600;
    let escrow_id = test.contract.create_escrow(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &release_timestamp,
    );

    let result =
        test.contract
            .try_dispute_escrow(&test.seller, &escrow_id, &"reason".into_val(&test.env));
    assert_eq!(result, Err(Ok(ContractError::NotBuyer)));
}

#[test]
fn test_dispute_fails_if_already_disputed() {
    let test = EscrowTest::setup();
    let release_timestamp = test.env.ledger().timestamp() + 3600;
    let escrow_id = test.contract.create_escrow(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &release_timestamp,
    );
    test.contract
        .dispute_escrow(&test.buyer, &escrow_id, &"reason1".into_val(&test.env));

    let result =
        test.contract
            .try_dispute_escrow(&test.buyer, &escrow_id, &"reason2".into_val(&test.env));
    assert_eq!(result, Err(Ok(ContractError::EscrowAlreadyDisputed)));
}

#[test]
fn test_resolve_dispute_fails_if_not_admin() {
    let test = EscrowTest::setup();
    let release_timestamp = test.env.ledger().timestamp() + 3600;
    let escrow_id = test.contract.create_escrow(
        &test.buyer,
        &test.seller,
        &1000,
        &test.token.address,
        &release_timestamp,
    );
    test.contract
        .dispute_escrow(&test.buyer, &escrow_id, &"reason".into_val(&test.env));

    // Seller (not admin) tries to resolve
    let result = test
        .contract
        .try_resolve_dispute_and_refund(&test.seller, &escrow_id);
    assert_eq!(result, Err(Ok(ContractError::NotAdmin)));
}
