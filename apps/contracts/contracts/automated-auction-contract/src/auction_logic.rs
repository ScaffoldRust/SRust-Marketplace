use soroban_sdk::{token, Address, Env, String};

use crate::{
    error::ContractError,
    event,
    storage::{self, Auction, AuctionStatus},
};

/// Creates a new auction and stores it in persistent storage.
pub fn create_auction(
    env: &Env,
    seller: Address,
    item_description: String,
    starting_price: i128,
    min_bid_increment: i128,
    duration_seconds: u64,
    payment_token: Address,
) -> Result<u64, ContractError> {
    seller.require_auth();

    if starting_price <= 0 || min_bid_increment <= 0 {
        return Err(ContractError::InvalidInput);
    }

    let auction_id = storage::get_next_auction_id(env);
    let end_timestamp = env.ledger().timestamp() + duration_seconds;

    let auction = Auction {
        auction_id,
        seller: seller.clone(),
        item_description,
        starting_price,
        min_bid_increment,
        end_timestamp,
        payment_token,
        highest_bidder: None,
        highest_bid: starting_price,
        status: AuctionStatus::Pending,
    };

    storage::set_auction(env, &auction);
    event::auction_created(env, auction_id, &seller, end_timestamp);

    Ok(auction_id)
}

/// Places a bid on an active auction, locking the bidder's funds.
pub fn place_bid(
    env: &Env,
    bidder: Address,
    auction_id: u64,
    bid_amount: i128,
) -> Result<(), ContractError> {
    bidder.require_auth();

    let mut auction = storage::get_auction(env, auction_id)?;

    if env.ledger().timestamp() >= auction.end_timestamp {
        return Err(ContractError::AuctionHasEnded);
    }

    if bid_amount <= 0 {
        return Err(ContractError::InvalidBidAmount);
    }

    if bid_amount < auction.highest_bid + auction.min_bid_increment {
        return Err(ContractError::BidTooLow);
    }
    
    // If there was a previous bidder, refund their bid.
    if let Some(previous_bidder) = auction.highest_bidder {
        let token_client = token::Client::new(env, &auction.payment_token);
        token_client.transfer(
            &env.current_contract_address(),
            &previous_bidder,
            &auction.highest_bid,
        );
    }

    // Lock the new bidder's funds in the contract.
    let token_client = token::Client::new(env, &auction.payment_token);
    token_client.transfer(&bidder, &env.current_contract_address(), &bid_amount);

    // Update auction state
    auction.highest_bidder = Some(bidder.clone());
    auction.highest_bid = bid_amount;
    auction.status = AuctionStatus::Active;

    storage::set_auction(env, &auction);
    event::bid_placed(env, auction_id, &bidder, bid_amount);

    Ok(())
}

/// Closes an expired auction, transferring funds to the seller and refunding non-winners.
pub fn close_auction(env: &Env, auction_id: u64) -> Result<(), ContractError> {
    let mut auction = storage::get_auction(env, auction_id)?;

    if env.ledger().timestamp() < auction.end_timestamp {
        return Err(ContractError::AuctionNotEnded);
    }

    if auction.status == AuctionStatus::Closed {
        // Auction is already closed, do nothing.
        return Ok(());
    }

    let token_client = token::Client::new(env, &auction.payment_token);

    if let Some(winner) = auction.highest_bidder.clone() {
        // There was a winner. Transfer funds to the seller.
        token_client.transfer(
            &env.current_contract_address(),
            &auction.seller,
            &auction.highest_bid,
        );
        event::auction_closed(env, auction_id, Some(winner), auction.highest_bid);
    } else {
        // No bids were placed.
        event::auction_closed(env, auction_id, None, 0);
    }

    auction.status = AuctionStatus::Closed;
    storage::set_auction(env, &auction);

    Ok(())
}

/// Allows the seller to cancel an auction if no bids have been placed.
pub fn cancel_auction(env: &Env, seller: Address, auction_id: u64) -> Result<(), ContractError> {
    seller.require_auth();

    let mut auction = storage::get_auction(env, auction_id)?;

    if auction.seller != seller {
        return Err(ContractError::NotAuctionSeller);
    }

    if auction.status == AuctionStatus::Active {
        return Err(ContractError::AuctionHasBids);
    }
    
    if auction.status == AuctionStatus::Closed {
        return Err(ContractError::AuctionHasEnded);
    }

    auction.status = AuctionStatus::Closed; // Mark as closed to prevent further actions.
    storage::set_auction(env, &auction);
    event::auction_cancelled(env, auction_id, &seller);

    Ok(())
}
