# Installment Payment Smart Contract

A flexible payment scheduling system built with Rust and the Soroban SDK for the Stellar blockchain. This smart contract enables buyers to pay for goods or services in multiple installments while providing sellers with guarantees and clear payment terms.

## 🌟 Features

### 💰 Flexible Payment Scheduling
- **Multiple Installments**: Break large payments into manageable chunks
- **Customizable Schedule**: Set number of installments and payment frequency
- **Deadline Enforcement**: Clear payment deadlines with automatic validation

### 🤝 Buyer-Seller Agreement
- **Explicit Acceptance**: Seller must accept the installment agreement
- **Clear Terms**: Transparent payment schedule and conditions
- **Mutual Protection**: Safeguards for both buyer and seller

### 🔄 Payment Processing
- **Installment Tracking**: Monitor payment progress and completion
- **Automatic Validation**: Verify payments against schedule
- **Completion Handling**: Finalize agreement when all installments are paid

### 🛡️ Risk Management
- **Cancellation Options**: Cancel and refund capabilities for valid scenarios
- **Deadline Enforcement**: Strict validation of payment timing
- **Agreement Finalization**: Clear completion process

## 🏗️ Architecture

### File Structure
```
src/
├── lib.rs                 # Main contract interface
├── contract.rs            # Core business logic
├── error.rs               # Error definitions
├── events.rs              # Event system
├── storage.rs             # Data storage utilities
└── test.rs                # Comprehensive test suite
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
// Initialize with admin address
contract.initialize(env, admin_address)
```

### 2. Create an Installment Agreement
```rust
let agreement_id = contract.create_installment_agreement(
    env,
    buyer_address,
    seller_address,
    token_address,
    total_amount,
    num_installments,
    installment_period,
    "Purchase of high-value item with payment plan".into(),
);
```

### 3. Accept the Agreement (Seller)
```rust
// Seller accepts the installment agreement
contract.accept_installment_agreement(env, agreement_id, seller_address);
```

### 4. Make Installment Payments
```rust
// Buyer pays an installment
contract.pay_on_installment(env, agreement_id, buyer_address, installment_number);
```

### 5. Finalize the Agreement
```rust
// After all installments are paid
contract.finalize_agreement(env, agreement_id, seller_address);
```

### 6. Cancel and Refund (if needed)
```rust
// Cancel agreement and refund any paid installments
contract.cancel_and_refund_agreement(env, agreement_id, canceller_address);
```

## 🔄 Contract Workflow

1. **Agreement Creation**: Buyer creates an installment agreement with payment terms
2. **Seller Acceptance**: Seller reviews and accepts the agreement
3. **Payment Process**: Buyer makes payments according to the schedule
4. **Agreement Completion**: After all installments are paid, the agreement is finalized
5. **Optional Cancellation**: If needed, the agreement can be cancelled with appropriate refunds

## 📊 Contract States

| Status | Description | Available Actions |
|--------|-------------|-------------------|
| **Created** | Agreement created, awaiting seller acceptance | Accept, Cancel |
| **Active** | Agreement accepted, payments in progress | Pay Installments, Cancel |
| **Completed** | All installments paid, agreement finalized | View Only |
| **Cancelled** | Agreement cancelled, funds refunded | View Only |

## 🛡️ Security Features

- **Authorization Checks**: All functions require proper authentication via `require_auth()`
- **State Validation**: Strict state machine prevents invalid transitions
- **Deadline Enforcement**: Payment deadlines are strictly enforced
- **Fund Protection**: Installment payments are securely processed

## 📚 Test Coverage

The contract includes comprehensive tests covering:
- Contract initialization
- Creating installment agreements
- Accepting agreements by sellers
- Payment processing on installments
- Handling payments past deadlines
- Cancellation and refund mechanisms
- Agreement finalization

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.