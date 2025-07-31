# Automated Auction Smart Contract

This document provides detailed instructions for deploying and interacting with the Automated Auction smart contract on the Stellar network using the Soroban SDK. This contract facilitates transparent, secure, and automated auctions for a marketplace.

## 🏗️ Contract Architecture

The contract is designed with a clear separation of concerns:

* **`lib.rs`**: The main entry point, defining the contract's public interface.
* **`auction_logic.rs`**: Contains the core business logic for creating, bidding on, and closing auctions.
* **`storage.rs`**: Defines all on-chain data structures (`Auction`, `AuctionStatus`) and storage keys.
* **`event.rs`**: Handles the emission of on-chain events for key actions.
* **`error.rs`**: Defines custom contract errors for predictable and clear error handling.

## 🗂️ Features

* **Auction Creation**: Allows sellers to start auctions with a specified item, starting price, minimum bid increment, and duration.
* **Secure Bidding**: Enables users to place bids, automatically locking their funds in the contract. The contract ensures all new bids are valid and higher than the current one.
* **Automatic Refunds**: When a bidder is outbid, their funds are immediately and automatically refunded.
* **Automated Closure**: Once the auction's end time is reached, anyone can trigger the `close_auction` function to finalize the auction, transferring the winning bid to the seller and refunding the losing bidders.
* **Cancellation**: Sellers can cancel an auction, but only if no bids have been placed yet.

## 🔑 Key Functions

### State-Changing Functions

* `create_auction(seller: Address, ...)`: Creates a new auction.
* `place_bid(bidder: Address, auction_id: u64, bid_amount: i128)`: Places a bid on an active auction.
* `close_auction(auction_id: u64)`: Finalizes an auction after it has expired.
* `cancel_auction(seller: Address, auction_id: u64)`: Cancels an auction if it has no bids.

### Read-Only Functions

* `get_auction(auction_id: u64)`: Retrieves the details of a specific auction.

## 📦 Deployment and Usage Guide

### Prerequisites

* [Rust](https://www.rust-lang.org/tools/install)
* [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup)

### Build and Test
```
# Build the contract WASM
soroban contract build

# Run the test suite
cargo test
```

### Deployment and Interaction Workflow

This section provides a complete, step-by-step example of how to deploy and interact with the contract on the Stellar testnet.

#### Step 1: Set Up Identities

You will need at least two identities: one for the **seller** and one for a **bidder**.
```
# Create and fund a seller identity
soroban config identity generate seller
soroban config identity fund seller --network testnet

# Create and fund a bidder identity
soroban config identity generate bidder_a
soroban config identity fund bidder_a --network testnet
```

#### Step 2: Deploy a Payment Token

Auctions require an SAC (Stellar Asset Contract) token for payments.
```
# Deploy a token, with the seller as the admin
TOKEN_ID=$(soroban contract deploy \
  --source seller \
  --network testnet \
  --wasm target/wasm32-unknown-unknown/release/soroban_token_contract.wasm)

# Initialize the token
soroban contract invoke \
  --id $TOKEN_ID \
  --source seller \
  --network testnet -- \
  initialize \
  --admin $(soroban config identity address seller) \
  --decimal 7 \
  --name "MarketToken" \
  --symbol "MKT"

# Mint tokens to the bidder so they can participate
soroban contract invoke \
  --id $TOKEN_ID \
  --source seller \
  --network testnet -- \
  mint \
  --to $(soroban config identity address bidder_a) \
  --amount 10000
```

#### Step 3: Deploy and Use the Auction Contract

**Workflow: Creating an Auction**

The seller deploys the auction contract and creates a new auction.
```
# 1. Deploy the auction contract
AUCTION_CONTRACT_ID=$(soroban contract deploy \
  --source seller \
  --network testnet \
  --wasm target/wasm32-unknown-unknown/release/automated_auction_contract.wasm)

# 2. Create the auction
# Let's create an auction for a "Digital Art Piece" starting at 100 MKT, with a duration of 1 hour (3600 seconds)
soroban contract invoke \
  --id $AUCTION_CONTRACT_ID \
  --source seller \
  --network testnet -- \
  create_auction \
  --seller $(soroban config identity address seller) \
  --item_description "Digital Art Piece" \
  --starting_price 100 \
  --min_bid_increment 10 \
  --duration_seconds 3600 \
  --payment_token $TOKEN_ID
```
This command will return `1`, which is the `auction_id` for our new auction.

**Workflow: Placing Bids**

Bidder A places a bid.
```
# Bidder A places a bid of 110 MKT
soroban contract invoke \
  --id $AUCTION_CONTRACT_ID \
  --source bidder_a \
  --network testnet -- \
  place_bid \
  --bidder $(soroban config identity address bidder_a) \
  --auction_id 1 \
  --bid_amount 110
```
At this point, 110 MKT tokens are transferred from Bidder A's account and locked in the auction contract.

**Workflow: Finalizing an Auction**

After the auction duration (1 hour in our example) has passed, anyone can call `close_auction` to finalize it.
```
# 1. (After 1 hour) Close the auction
soroban contract invoke \
  --id $AUCTION_CONTRACT_ID \
  --source seller \
  --network testnet -- \
  close_auction \
  --auction_id 1

# 2. Verify the outcome
# Check the seller's balance. They should have received the winning bid of 110 MKT.
soroban contract invoke \
  --id $TOKEN_ID \
  --source seller \
  --network testnet -- \
  balance \
  --id $(soroban config identity address seller)

# Check the auction contract's balance. It should be 0.
soroban contract invoke \
  --id $TOKEN_ID \
  --source seller \
  --network testnet -- \
  balance \
  --id $AUCTION_CONTRACT_ID
```
This demonstrates that the funds were securely transferred to the winner upon the auction's conclusion.
