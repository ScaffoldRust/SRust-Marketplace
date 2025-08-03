# Deferred Settlement Smart Contract

A sophisticated delayed payment processing system built with Rust and the Soroban SDK for the Stellar blockchain. This smart contract enables secure transaction settlements with verification conditions and time-based triggers, perfect for marketplace scenarios requiring confirmation periods or waiting for external events.

## 🌟 Features

### ⏱️ Time-Based Settlement
- **Delayed Processing**: Payments held in escrow until specified time conditions are met
- **Configurable Timeframes**: Customizable settlement periods based on transaction requirements
- **Automatic Execution**: Self-executing settlement when time conditions are satisfied

### 🔍 Verification Conditions
- **Oracle Integration**: External verification through trusted oracles
- **Condition Verification**: Settlement only proceeds when specified conditions are met
- **Flexible Verification Logic**: Support for various verification scenarios

### ⚖️ Dispute Resolution
- **Dispute Initiation**: Either party can raise disputes during the settlement period
- **Resolution Mechanisms**: Clear processes for handling contested transactions
- **Evidence Submission**: Support for providing proof in dispute cases

### 🔐 Security & Authorization
- **Role-Based Access**: Strict permissions for transaction participants
- **Authentication Required**: All operations require proper address authentication
- **State Protection**: Contract state validation prevents invalid operations

## 🏗️ Architecture

### File Structure
```
src/
├── lib.rs                 # Main contract interface
├── contract.rs            # Core business logic
├── error.rs               # Error definitions
├── events.rs              # Event system
└── test.rs                # Comprehensive test suite
```

## 🚀 Getting Started

### Prerequisites
- Rust 1.70+
- Stellar CLI
- Stellar account with testnet tokens

### Building the Contract

```bash
# Build the contract
cargo build --target wasm32-unknown-unknown --release
```

```bash
# Build with Stellar CLI
stellar contract build
```

### Testing

```bash
# Run the test suite
cargo test
```

## 📖 Usage

### 1. Initialize Contract
```rust
// Initialize with admin address
contract.initialize(env, admin_address)
```

### 2. Create a Deferred Transaction
```rust
let transaction_id = contract.create_transaction(
    env,
    buyer_address,
    seller_address,
    token_address,
    1000_0000000, // 1000 tokens (with decimals)
    current_time + 86400 * 3,  // 3 days settlement delay
    "Payment for digital services".into(),
);
```

### 3. Oracle Confirmation
```rust
// Oracle confirms the transaction conditions are met
contract.oracle_confirmation(env, transaction_id, oracle_address);
```

### 4. Dispute Handling
```rust
// Initiate a dispute
contract.initiate_dispute(env, transaction_id, buyer_address, "Service not delivered as described".into());

// Resolve a dispute
contract.resolve_dispute(env, transaction_id, admin_address, true); // true = in favor of buyer
```

## 🔄 Contract Workflow

1. **Transaction Creation**: Buyer creates a deferred transaction with specified settlement time
2. **Funds Locking**: Funds are locked in escrow until settlement conditions are met
3. **Verification Period**: During this time, conditions can be verified or disputes raised
4. **Settlement**: When conditions are met and time has passed, funds are released to the seller
5. **Dispute Resolution**: If disputes arise, they are resolved by authorized parties

## 📊 Contract States

| Status | Description | Available Actions |
|--------|-------------|-------------------|
| **Created** | Transaction initialized | Verify Conditions, Initiate Dispute |
| **Verified** | Conditions verified by oracle | Wait for Settlement Time |
| **Disputed** | Dispute raised by a party | Resolve Dispute |
| **Completed** | Transaction settled, funds released | View Only |
| **Refunded** | Transaction cancelled, funds returned | View Only |

## 🛡️ Security Features

- **Authorization Checks**: All functions require proper authentication via `require_auth()`
- **State Validation**: Strict state machine prevents invalid transitions
- **Deadline Enforcement**: Time-based conditions are strictly enforced
- **Fund Protection**: Escrowed funds protected from unauthorized access

## 📚 Test Coverage

The contract includes comprehensive tests covering:
- Transaction creation with various parameters
- Handling invalid transaction amounts
- Unauthorized dispute handling
- Oracle confirmation processes
- Time-based condition verification
- Dispute initiation and resolution

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
