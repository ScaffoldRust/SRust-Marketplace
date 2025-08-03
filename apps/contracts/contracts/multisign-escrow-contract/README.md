# Multisignature Escrow Smart Contract

A secure multi-signature escrow system built with Rust and the Soroban SDK for the Stellar blockchain. This smart contract enables high-security transactions requiring multiple approvals before funds can be released, providing additional safety for high-value marketplace transactions.

## 🌟 Features

### 🔐 Multi-Signature Security
- **Multiple Approvers**: Requires signatures from multiple parties to release funds
- **Configurable Thresholds**: Set custom approval requirements
- **Secure Authorization**: All approvals require proper authentication

### 💰 Escrow Management
- **Secure Fund Locking**: Funds securely held in escrow until approval conditions are met
- **Deadline Enforcement**: Time-based automatic refund if approvals not received
- **Real Token Transfers**: Integration with Stellar token contracts for actual asset transfers

### ⏱️ Time-Based Protections
- **Refund Deadlines**: Automatic refund capabilities after specified timeframes
- **Expiration Handling**: Clear processes for handling expired escrow contracts
- **Time-Based State Changes**: Contract state evolves based on time conditions

### 🔍 Transparency & Verification
- **Approval Tracking**: Monitor which parties have approved the transaction
- **State Querying**: Check current contract status and approval count
- **Event Logging**: Complete audit trail of all contract activities

## 🏗️ Architecture

### File Structure
```
src/
├── lib.rs                 # Main contract interface and implementation
├── escrow.rs              # Core escrow logic
├── test.rs                # Comprehensive test suite
└── types.rs               # Data structures and types
```

## 🚀 Getting Started

### Prerequisites
- Rust 1.70+
- Soroban CLI
- Stellar account with testnet tokens

### Building the Contract

```bash
# Build the contract
cargo build --target wasm32-unknown-unknown --release
```

```bash
# Build with Soroban CLI
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
// Initialize with required parameters
contract.initialize(
    env,
    sender,
    receiver,
    token,
    amount,
    required_approvals,
    deadline,
)
```

### 2. Deposit Funds
```rust
// Deposit funds into escrow
contract.deposit(env, sender)
```

### 3. Approve Transaction
```rust
// Approve the transaction (by authorized approvers)
contract.approve(env, approver)
```

### 4. Release Funds
```rust
// Release funds when approval threshold is met
contract.release(env, sender)
```

### 5. Process Refund
```rust
// Refund after deadline if approvals not met
contract.refund(env, sender)
```

### 6. Check Contract State
```rust
// Get current contract state
let state = contract.get_state(env)
```

## 🔄 Contract Workflow

1. **Contract Creation**: Initialize with parties, amount, and approval requirements
2. **Fund Deposit**: Sender deposits funds into escrow
3. **Approval Collection**: Designated approvers submit their approvals
4. **Fund Release**: When approval threshold is met, funds are released to receiver
5. **Alternative: Refund**: If deadline passes without sufficient approvals, funds return to sender

## 📊 Contract States

| Status | Description | Available Actions |
|--------|-------------|-------------------|
| **Initialized** | Contract created but not funded | Deposit |
| **Funded** | Funds deposited, awaiting approvals | Approve, Refund (after deadline) |
| **Approved** | Approval threshold met | Release |
| **Completed** | Funds released to receiver | View Only |
| **Refunded** | Funds returned to sender | View Only |

## 🛡️ Security Features

- **Authorization Checks**: All functions require proper authentication via `require_auth()`
- **State Validation**: Strict state machine prevents invalid transitions
- **Deadline Enforcement**: Time-based conditions are strictly enforced
- **Fund Protection**: Escrowed funds protected from unauthorized access

## 📚 Test Coverage

The contract includes comprehensive tests covering:
- Contract initialization
- Deposit functionality
- Approval mechanisms
- Fund release with sufficient approvals
- Refund processes after deadlines
- State management and retrieval

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
