# Timelock Smart Contract

A secure time-locked token deposit system built with Rust and the Soroban SDK for the Stellar blockchain. This smart contract enables users to lock tokens for a specified period, with optional clawback capabilities, providing temporal security for marketplace transactions and token vesting.

## 🌟 Features

### ⏱️ Time-Based Locking
- **Configurable Lock Duration**: Set custom timeframes for token locking
- **Time Validation**: Strict enforcement of lock periods
- **Automatic Unlocking**: Tokens become available after lock period expires

### 💰 Deposit Management
- **Secure Token Storage**: Safely hold tokens during the lock period
- **Multiple Deposit Support**: Handle various deposits with different parameters
- **Token Integration**: Works with any Stellar token via the Soroban token interface

### 🔄 Withdrawal Controls
- **Time-Based Restrictions**: Withdrawals only permitted after lock period
- **Owner Authorization**: Only deposit owners can withdraw their tokens
- **Validation Checks**: Comprehensive verification before processing withdrawals

### 🔙 Clawback Mechanism
- **Configurable Clawback**: Optional ability to reclaim tokens
- **Clawback Delay**: Set minimum waiting period before clawback is possible
- **Authorization Controls**: Strict permissions for clawback operations

## 🏗️ Architecture

### File Structure
```
src/
├── lib.rs                 # Main contract interface
├── contract.rs            # Core business logic
├── clawback_delay.rs      # Clawback delay functionality
├── deposit.rs             # Deposit management
├── error.rs               # Error definitions
├── events.rs              # Event system
├── lock_duration.rs       # Lock duration settings
└── storage_types.rs       # Data structures and constants
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

### 1. Set Lock Duration
```rust
// Set the default lock duration (in ledger closeouts)
contract.lock_duration(env, 86400) // 1 day
```

### 2. Set Clawback Delay
```rust
// Set the clawback delay (in ledger closeouts)
contract.clawback_delay(env, 43200) // 12 hours
```

### 3. Deposit Tokens
```rust
// Deposit tokens with a lock period
contract.deposit(
    env,
    depositor_address,
    token_address,
    1000_0000000, // 1000 tokens (with decimals)
    recipient_address,
    current_time + 86400 * 7, // 7 days lock
)
```

### 4. Withdraw Tokens
```rust
// Withdraw tokens after lock period
contract.withdraw(
    env,
    recipient_address,
    token_address,
    depositor_address,
)
```

### 5. Clawback (if needed)
```rust
// Clawback tokens (if clawback delay has passed)
contract.clawback(
    env,
    depositor_address,
    token_address,
    recipient_address,
)
```

### 6. Check Deposit Status
```rust
// Get deposit information
let deposit_info = contract.get_deposit(
    env,
    depositor_address,
    token_address,
    recipient_address,
)
```

## 🔄 Contract Workflow

1. **Configuration**: Set lock duration and clawback delay parameters
2. **Token Deposit**: User deposits tokens with specified lock period and recipient
3. **Locking Period**: Tokens remain locked and cannot be withdrawn
4. **After Lock Period**: Recipient can withdraw tokens
5. **Optional Clawback**: If recipient doesn't withdraw, depositor can clawback after delay

## 📊 Contract States

| Status | Description | Available Actions |
|--------|-------------|-------------------|
| **Locked** | Tokens locked, within lock period | View Only |
| **Unlocked** | Lock period expired, ready for withdrawal | Withdraw, Clawback (after delay) |
| **Withdrawn** | Tokens withdrawn by recipient | View Only |
| **Clawbacked** | Tokens reclaimed by depositor | View Only |

## 🛡️ Security Features

- **Authorization Checks**: All functions require proper authentication via `require_auth()`
- **Time Validation**: Strict enforcement of lock periods and delays
- **State Validation**: Comprehensive checks before any token movement
- **Fund Protection**: Locked tokens protected from unauthorized access

## 📚 Test Coverage

The contract includes comprehensive tests covering:
- Lock duration settings
- Clawback delay settings
- Deposit functionality and validation
- Withdrawal mechanisms
- Clawback processes
- Authorization checks
- Event emission

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
