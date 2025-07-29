use soroban_sdk::{contracttype, Address, Env, String};

use crate::error::ContractError;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AuctionStatus {
    Pending, // Not yet started (can be cancelled)
    Active,  // Bidding is open
    Closed,  // Ended and funds transferred
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Auction {
    pub auction_id: u64,
    pub seller: Address,
    pub item_description: String,
    pub starting_price: i128,
    pub min_bid_increment: i128,
    pub end_timestamp: u64,
    pub payment_token: Address,
    pub highest_bidder: Option<Address>,
    pub highest_bid: i128,
    pub status: AuctionStatus,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    AuctionCounter,
    Auction(u64),
}

// --- Storage Helper Functions ---

pub fn get_next_auction_id(env: &Env) -> u64 {
    let current_id: u64 = env
        .storage()
        .instance()
        .get(&DataKey::AuctionCounter)
        .unwrap_or(0);
    let next_id = current_id + 1;
    env.storage()
        .instance()
        .set(&DataKey::AuctionCounter, &next_id);
    next_id
}

pub fn get_auction(env: &Env, auction_id: u64) -> Result<Auction, ContractError> {
    env.storage()
        .persistent()
        .get(&DataKey::Auction(auction_id))
        .ok_or(ContractError::AuctionNotFound)
}

pub fn set_auction(env: &Env, auction: &Auction) {
    env.storage()
        .persistent()
        .set(&DataKey::Auction(auction.auction_id), auction);
}
