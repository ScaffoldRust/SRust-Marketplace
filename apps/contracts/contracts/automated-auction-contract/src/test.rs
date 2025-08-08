#![cfg(test)]

use super::*;
use crate::{error::ContractError, storage::AuctionStatus};
use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    token, Address, Env, IntoVal,
};
use token::StellarAssetClient as TokenAdminClient;

// --- Test Harness ---

// Helper function to create and initialize a token contract, returning both a user client and an admin client.
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

struct AuctionTest<'a> {
    env: Env,
    contract: AutomatedAuctionContractClient<'a>,
    token: token::Client<'a>,
    seller: Address,
    bidder1: Address,
    bidder2: Address,
}

impl<'a> AuctionTest<'a> {
    fn setup() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        // Accounts
        let seller = Address::generate(&env);
        let bidder1 = Address::generate(&env);
        let bidder2 = Address::generate(&env);

        let (token_client, token_admin_client) = create_token_contract(&env, &seller);

        // Main Auction Contract
        let contract_id = env.register(AutomatedAuctionContract, ());
        let contract = AutomatedAuctionContractClient::new(&env, &contract_id);

        // Fund bidders using the admin client.
        token_admin_client.mint(&bidder1, &10000);
        token_admin_client.mint(&bidder2, &10000);

        AuctionTest {
            env,
            contract,
            token: token_client, // The regular client is stored for transfers and balance checks.
            seller,
            bidder1,
            bidder2,
        }
    }
}

// --- Tests ---

#[test]
fn test_create_auction() {
    let test = AuctionTest::setup();

    let auction_id = test.contract.create_auction(
        &test.seller,
        &"Test Item".into_val(&test.env),
        &100,  // starting_price
        &10,   // min_bid_increment
        &3600, // duration_seconds
        &test.token.address,
    );

    assert_eq!(auction_id, 1);

    let auction = test.contract.get_auction(&auction_id);
    assert_eq!(auction.seller, test.seller);
    assert_eq!(auction.starting_price, 100);
    assert_eq!(auction.highest_bid, 100);
    assert_eq!(auction.status, AuctionStatus::Pending);
}

#[test]
fn test_place_bid_success() {
    let test = AuctionTest::setup();
    let auction_id = test.contract.create_auction(
        &test.seller,
        &"Item".into_val(&test.env),
        &100,
        &10,
        &3600,
        &test.token.address,
    );

    test.contract.place_bid(&test.bidder1, &auction_id, &110);

    let auction = test.contract.get_auction(&auction_id);
    assert_eq!(auction.highest_bidder, Some(test.bidder1.clone()));
    assert_eq!(auction.highest_bid, 110);
    assert_eq!(auction.status, AuctionStatus::Active);

    // Check that funds are locked in the contract
    assert_eq!(test.token.balance(&test.bidder1), 10000 - 110);
    assert_eq!(test.token.balance(&test.contract.address), 110);
}

#[test]
fn test_outbid_and_refund() {
    let test = AuctionTest::setup();
    let auction_id = test.contract.create_auction(
        &test.seller,
        &"Item".into_val(&test.env),
        &100,
        &10,
        &3600,
        &test.token.address,
    );

    // Bidder 1 places a bid
    test.contract.place_bid(&test.bidder1, &auction_id, &110);
    assert_eq!(test.token.balance(&test.bidder1), 9890);
    assert_eq!(test.token.balance(&test.contract.address), 110);

    // Bidder 2 outbids
    test.contract.place_bid(&test.bidder2, &auction_id, &120);

    let auction = test.contract.get_auction(&auction_id);
    assert_eq!(auction.highest_bidder, Some(test.bidder2.clone()));
    assert_eq!(auction.highest_bid, 120);

    // Check that Bidder 1 was refunded and Bidder 2's funds are locked
    assert_eq!(test.token.balance(&test.bidder1), 10000); // Full refund
    assert_eq!(test.token.balance(&test.bidder2), 10000 - 120);
    assert_eq!(test.token.balance(&test.contract.address), 120);
}

#[test]
fn test_place_bid_errors() {
    let test = AuctionTest::setup();
    let auction_id = test.contract.create_auction(
        &test.seller,
        &"Item".into_val(&test.env),
        &100,
        &10,
        &10,
        &test.token.address,
    );

    // Bid too low (not meeting minimum increment)
    let result_low = test
        .contract
        .try_place_bid(&test.bidder1, &auction_id, &105);
    assert_eq!(result_low, Err(Ok(ContractError::BidTooLow)));

    // Bid exactly at minimum increment (should succeed)
    test.contract.place_bid(&test.bidder1, &auction_id, &110);

    // Bid too low (equal to current highest)
    let result_equal = test
        .contract
        .try_place_bid(&test.bidder2, &auction_id, &110);
    assert_eq!(result_equal, Err(Ok(ContractError::BidTooLow)));

    // Expire the auction
    test.env.ledger().with_mut(|l| l.timestamp = 20);

    // Bid after auction ended
    let result_ended = test
        .contract
        .try_place_bid(&test.bidder2, &auction_id, &120);
    assert_eq!(result_ended, Err(Ok(ContractError::AuctionHasEnded)));
}

#[test]
fn test_close_auction_with_winner() {
    let test = AuctionTest::setup();
    let auction_id = test.contract.create_auction(
        &test.seller,
        &"Item".into_val(&test.env),
        &100,
        &10,
        &10,
        &test.token.address,
    );
    test.contract.place_bid(&test.bidder1, &auction_id, &150);

    // Expire the auction
    test.env.ledger().with_mut(|l| l.timestamp = 20);

    test.contract.close_auction(&auction_id);

    let auction = test.contract.get_auction(&auction_id);
    assert_eq!(auction.status, AuctionStatus::Closed);

    // Check that funds were transferred to the seller
    assert_eq!(test.token.balance(&test.seller), 150);
    assert_eq!(test.token.balance(&test.contract.address), 0);
    assert_eq!(test.token.balance(&test.bidder1), 10000 - 150);
}

#[test]
fn test_close_auction_no_bids() {
    let test = AuctionTest::setup();
    let auction_id = test.contract.create_auction(
        &test.seller,
        &"Item".into_val(&test.env),
        &100,
        &10,
        &10,
        &test.token.address,
    );

    // Expire the auction
    test.env.ledger().with_mut(|l| l.timestamp = 20);

    test.contract.close_auction(&auction_id);

    let auction = test.contract.get_auction(&auction_id);
    assert_eq!(auction.status, AuctionStatus::Closed);
    assert_eq!(auction.highest_bidder, None);

    // Check that no funds were moved
    assert_eq!(test.token.balance(&test.seller), 0);
    assert_eq!(test.token.balance(&test.contract.address), 0);
}

#[test]
fn test_close_auction_not_ended() {
    let test = AuctionTest::setup();
    let auction_id = test.contract.create_auction(
        &test.seller,
        &"Item".into_val(&test.env),
        &100,
        &10,
        &3600,
        &test.token.address,
    );

    let result = test.contract.try_close_auction(&auction_id);
    assert_eq!(result, Err(Ok(ContractError::AuctionNotEnded)));
}

#[test]
fn test_cancel_auction() {
    let test = AuctionTest::setup();
    let auction_id = test.contract.create_auction(
        &test.seller,
        &"Item".into_val(&test.env),
        &100,
        &10,
        &3600,
        &test.token.address,
    );

    // Seller successfully cancels
    test.contract.cancel_auction(&test.seller, &auction_id);
    let auction = test.contract.get_auction(&auction_id);
    assert_eq!(auction.status, AuctionStatus::Closed);

    // Non-seller tries to cancel
    let auction_id_2 = test.contract.create_auction(
        &test.seller,
        &"Item 2".into_val(&test.env),
        &100,
        &10,
        &3600,
        &test.token.address,
    );
    let result_auth = test
        .contract
        .try_cancel_auction(&test.bidder1, &auction_id_2);
    assert_eq!(result_auth, Err(Ok(ContractError::NotAuctionSeller)));

    // Seller tries to cancel after a bid
    test.contract.place_bid(&test.bidder1, &auction_id_2, &110);
    let result_bids = test
        .contract
        .try_cancel_auction(&test.seller, &auction_id_2);
    assert_eq!(result_bids, Err(Ok(ContractError::AuctionHasBids)));
}
