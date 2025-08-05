# Partial Payment (Deposit) Smart Contract

This document provides detailed instructions for deploying and interacting with the Partial Payment (Deposit) smart contract on the Stellar network using the Soroban SDK. This contract is designed for a marketplace environment to handle transactions that allow buyers to make multiple partial payments towards a purchase.

## 🏗️ Contract Architecture

The contract is designed with a clear separation of concerns:

* **`lib.rs`**: The main entry point, defining the contract's public interface.
* **`deposit_logic.rs`**: Contains the core business logic for managing the entire lifecycle of a partial payment transaction.
* **`storage.rs`**: Defines all on-chain data structures (`Transaction`, `TransactionStatus`) and storage keys.
* **`event.rs`**: Handles the emission of on-chain events for key actions like deposits and claims.
* **`error.rs`**: Defines custom contract errors for predictable and clear error handling.

## 🗂️ Features

* **Transaction Initialization**: Allows a buyer and seller to start a new transaction with a total amount and a payment deadline.
* **Secure Partial Deposits**: Enables buyers to make multiple deposits towards the total amount, with all funds securely locked in the contract.
* **Conditional Fund Release**: Once the total deposited amount meets the required total, the transaction is marked as "Funded," and the seller can claim the full payment.
* **Refund Mechanism**: Provides a secure process for buyers to get a full refund of their deposited amount if the payment deadline passes before the transaction is fully funded.
* **Cancellation**: Allows either the buyer or seller to cancel an underfunded transaction, which automatically refunds any deposited amount to the buyer.

## 🔑 Key Functions

### State-Changing Functions

* `start_transaction(buyer: Address, ...)`: Creates a new transaction.
* `make_deposit(buyer: Address, ...)`: Allows a buyer to deposit funds towards a transaction.
* `claim_payment(seller: Address, ...)`: Allows the seller to claim the full payment once funded.
* `request_refund(buyer: Address, ...)`: Allows the buyer to get a refund if the deadline has passed.
* `cancel_transaction(canceller: Address, ...)`: Allows either party to cancel an underfunded transaction.

### Read-Only Functions

* `get_transaction(transaction_id: u64)`: Retrieves the details of a specific transaction.

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

You will need at least two identities: one for the **seller** and one for the **buyer**.
```
# Create and fund a seller identity
soroban config identity generate seller
soroban config identity fund seller --network testnet

# Create and fund a buyer identity
soroban config identity generate buyer
soroban config identity fund buyer --network testnet
```

#### Step 2: Deploy a Payment Token

The contract requires an SAC (Stellar Asset Contract) token for payments.
```
# Deploy a token, with the seller as the admin
TOKEN_ID=$(soroban contract deploy \
  --source seller \
  --network testnet \
  --wasm path/to/your/soroban_token_contract.wasm)

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

# Mint tokens to the buyer so they can participate
soroban contract invoke \
  --id $TOKEN_ID \
  --source seller \
  --network testnet -- \
  mint \
  --to $(soroban config identity address buyer) \
  --amount 10000
```

#### Step 3: Deploy and Use the Partial Payment Contract

**Workflow: A Successful Transaction**

1. **Deploy the Contract**:
   ```
   DEPOSIT_CONTRACT_ID=$(soroban contract deploy \
     --source seller \
     --network testnet \
     --wasm target/wasm32-unknown-unknown/release/partial_payment_contract.wasm)
   ```

2. **Start the Transaction**: The buyer initiates a transaction to pay the seller 1000 MKT, with a deadline of 1 hour (3600 seconds).
   ```
   # Get the current ledger timestamp and add 3600
   DEADLINE=$(($(date +%s) + 3600))
   
   soroban contract invoke \
     --id $DEPOSIT_CONTRACT_ID \
     --source buyer \
     --network testnet -- \
     start_transaction \
     --buyer $(soroban config identity address buyer) \
     --seller $(soroban config identity address seller) \
     --total_amount 1000 \
     --payment_token $TOKEN_ID \
     --deadline $DEADLINE
   ```
   This will return `1`, the `transaction_id`.

3. **Make Partial Deposits**: The buyer makes two deposits.
   ```
   # First deposit of 400 MKT
   soroban contract invoke \
     --id $DEPOSIT_CONTRACT_ID \
     --source buyer \
     --network testnet -- \
     make_deposit \
     --buyer $(soroban config identity address buyer) \
     --transaction_id 1 \
     --deposit_amount 400
   
   # Second deposit of 600 MKT
   soroban contract invoke \
     --id $DEPOSIT_CONTRACT_ID \
     --source buyer \
     --network testnet -- \
     make_deposit \
     --buyer $(soroban config identity address buyer) \
     --transaction_id 1 \
     --deposit_amount 600
   ```

4. **Seller Claims Payment**: Now that the transaction is fully funded, the seller can claim the payment.
   ```
   soroban contract invoke \
     --id $DEPOSIT_CONTRACT_ID \
     --source seller \
     --network testnet -- \
     claim_payment \
     --seller $(soroban config identity address seller) \
     --transaction_id 1
   ```
   The 1000 MKT tokens are now transferred from the contract to the seller's account.
