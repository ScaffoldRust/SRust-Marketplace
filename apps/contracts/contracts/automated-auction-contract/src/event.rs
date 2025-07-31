use soroban_sdk::{symbol_short, Address, Env};

/// Emits an event when a new auction is created.
pub fn auction_created(env: &Env, auction_id: u64, seller: &Address, end_timestamp: u64) {
    let topics = (symbol_short!("created"), seller.clone());
    let data = (auction_id, end_timestamp);
    env.events().publish(topics, data);
}

/// Emits an event when a new bid is placed.
pub fn bid_placed(env: &Env, auction_id: u64, bidder: &Address, amount: i128) {
    let topics = (symbol_short!("new_bid"), bidder.clone());
    let data = (auction_id, amount);
    env.events().publish(topics, data);
}

/// Emits an event when an auction is closed.
pub fn auction_closed(env: &Env, auction_id: u64, winner: Option<Address>, winning_bid: i128) {
    let topics = (symbol_short!("closed"), auction_id);
    let data = (winner, winning_bid);
    env.events().publish(topics, data);
}

/// Emits an event when an auction is cancelled.
pub fn auction_cancelled(env: &Env, auction_id: u64, seller: &Address) {
    let topics = (symbol_short!("cancelled"), seller.clone());
    env.events().publish(topics, auction_id);
}
