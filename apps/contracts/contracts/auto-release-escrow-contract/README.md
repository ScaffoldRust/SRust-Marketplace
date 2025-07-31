# Auto-Release Escrow Smart Contract

This document provides detailed instructions for deploying and interacting with the Auto-Release Escrow smart contract on the Stellar network using the Soroban SDK. This contract is designed for a marketplace to manage transactions where funds are automatically released to the seller once predefined conditions are met.

## 🏗️ Contract Architecture

The contract is designed with a clear separation of concerns:

* **`lib.rs`**: The main entry point, defining the contract's public interface.
* **`escrow_logic.rs`**: Contains the core business logic for the entire escrow lifecycle.
* **`storage.rs`**: Defines all on-chain data structures (`Escrow`, `EscrowStatus`) and storage keys.
* **`event.rs`**: Handles the emission of on-chain events for key actions.
* **`error.rs`**: Defines custom contract errors for predictable and clear error handling.

## 🗂️ Features

* **Secure Deposit**: Allows buyers to deposit funds into a new escrow agreement, locking them securely in the contract.
* **Dual Release Conditions**: Funds can be released to the seller under two conditions, providing flexibility:
  1. **Time-Based Auto-Release**: Funds are automatically releasable after a predefined `release_timestamp` has passed.
  2. **Condition-Based Early Release**: The buyer can call `confirm_receipt` to manually approve the release before the timer expires.
* **Admin-Managed Disputes**: Buyers can raise a dispute, pausing the release process. A designated admin, set during initialization, can resolve disputes by refunding the buyer.
* **Admin Control**: The contract admin can securely transfer ownership to a new admin.
* **Transparent Event Logging**: Emits events for every critical action for easy monitoring and auditing.

## 🔑 Key Functions

### State-Changing Functions

* `initialize(admin: Address)`: Initializes the contract with a designated admin. Can only be called once.
* `set_admin(admin: Address, new_admin: Address)`: Allows the current admin to transfer admin rights.
* `create_escrow(buyer: Address, ...)`: Creates a new escrow and locks the buyer's funds.
* `confirm_receipt(buyer: Address, ...)`: Allows the buyer to confirm receipt, enabling an early release.
* `release_funds(escrow_id: u64)`: Releases funds to the seller if release conditions are met.
* `dispute_escrow(buyer: Address, ...)`: Allows the buyer to raise a dispute.
* `resolve_dispute_and_refund(admin: Address, ...)`: An admin-only function to resolve disputes by refunding the buyer.

### Read-Only Functions

* `get_escrow(escrow_id: u64)`: Retrieves the details of a specific escrow.

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

You will need identities for the **admin**, **seller**, and **buyer**.
```
soroban config identity generate admin
soroban config identity fund admin --network testnet

soroban config identity generate seller
soroban config identity fund seller --network testnet

soroban config identity generate buyer
soroban config identity fund buyer --network testnet
```

#### Step 2: Deploy a Payment Token

The contract requires an SAC (Stellar Asset Contract) token for payments.
```
# Deploy a token, with the admin as the token admin
TOKEN_ID=$(soroban contract deploy \
  --source admin \
  --network testnet \
  --wasm path/to/your/soroban_token_contract.wasm)

# Initialize the token
soroban contract invoke --id $TOKEN_ID --source admin --network testnet -- initialize --admin $(soroban config identity address admin) --decimal 7 --name "MarketToken" --symbol "MKT"

# Mint tokens to the buyer so they can participate
soroban contract invoke --id $TOKEN_ID --source admin --network testnet -- mint --to $(soroban config identity address buyer) --amount 10000
```

#### Step 3: Deploy and Use the Escrow Contract

**Workflow: Early Release via Buyer Confirmation**

1. **Deploy the Contract**:
   ```
   ESCROW_CONTRACT_ID=$(soroban contract deploy \
     --source admin \
     --network testnet \
     --wasm target/wasm32-unknown-unknown/release/auto_release_escrow_contract.wasm)
   ```

2. **Initialize the Contract**: Set the admin for the escrow contract. This is a critical one-time step.
   ```
   soroban contract invoke \
     --id $ESCROW_CONTRACT_ID \
     --source admin \
     --network testnet -- \
     initialize \
     --admin $(soroban config identity address admin)
   ```

3. **Create the Escrow**: The buyer creates an escrow to pay the seller 1000 MKT, with an auto-release time of 24 hours.
   ```
   DEADLINE=$(($(date +%s) + 86400))
   soroban contract invoke \
     --id $ESCROW_CONTRACT_ID \
     --source buyer \
     --network testnet -- \
     create_escrow \
     --buyer $(soroban config identity address buyer) \
     --seller $(soroban config identity address seller) \
     --amount 1000 \
     --payment_token $TOKEN_ID \
     --release_timestamp $DEADLINE
   ```
   This will return `1`, the `escrow_id`.

4. **Buyer Confirms Receipt**: The buyer receives the item quickly and confirms receipt, allowing the seller to be paid early.
   ```
   soroban contract invoke \
     --id $ESCROW_CONTRACT_ID \
     --source buyer \
     --network testnet -- \
     confirm_receipt \
     --buyer $(soroban config identity address buyer) \
     --escrow_id 1
   ```

5. **Release Funds**: Anyone can now call `release_funds` because the buyer has confirmed.
   ```
   soroban contract invoke \
     --id $ESCROW_CONTRACT_ID \
     --source seller \
     --network testnet -- \
     release_funds \
     --escrow_id 1
   ```
   The 1000 MKT are immediately transferred to the seller's account.
