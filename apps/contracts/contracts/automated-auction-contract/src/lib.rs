#![no_std]

mod auction_logic;
mod error;
mod event;
mod storage;
#[cfg(test)]
mod test;

use soroban_sdk::{contract, contractimpl, Address, Env, String};

use crate::{
    error::ContractError,
    storage::Auction,
};

#[contract]
pub struct AutomatedAuctionContract;

#[contractimpl]
impl AutomatedAuctionContract {
    /// Creates a new auction.
    pub fn create_auction(
        env: Env,
        seller: Address,
        item_description: String,
        starting_price: i128,
        min_bid_increment: i128,
        duration_seconds: u64,
        payment_token: Address,
    ) -> Result<u64, ContractError> {
        auction_logic::create_auction(
            &env,
            seller,
            item_description,
            starting_price,
            min_bid_increment,
            duration_seconds,
            payment_token,
        )
    }

    /// Places a bid on an active auction.
    pub fn place_bid(
        env: Env,
        bidder: Address,
        auction_id: u64,
        bid_amount: i128,
    ) -> Result<(), ContractError> {
        auction_logic::place_bid(&env, bidder, auction_id, bid_amount)
    }

    /// Closes an auction after its duration has expired.
    pub fn close_auction(env: Env, auction_id: u64) -> Result<(), ContractError> {
        auction_logic::close_auction(&env, auction_id)
    }

    /// Allows the seller to cancel an auction before any bids have been placed.
    pub fn cancel_auction(
        env: Env,
        seller: Address,
        auction_id: u64,
    ) -> Result<(), ContractError> {
        auction_logic::cancel_auction(&env, seller, auction_id)
    }

    // --- Read-Only Functions ---

    /// Retrieves the details of a specific auction.
    pub fn get_auction(env: Env, auction_id: u64) -> Result<Auction, ContractError> {
        storage::get_auction(&env, auction_id)
    }
}
