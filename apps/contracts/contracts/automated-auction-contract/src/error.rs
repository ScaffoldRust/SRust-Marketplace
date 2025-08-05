use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    // Auction State Errors
    AuctionNotActive = 1,
    AuctionHasEnded = 2,
    AuctionNotEnded = 3,
    AuctionHasBids = 4,

    // Bidding Errors
    BidTooLow = 5,
    InvalidBidAmount = 6,

    // Authorization Errors
    NotAuctionSeller = 7,

    // Data Errors
    AuctionNotFound = 8,
    InvalidInput = 9,
}
