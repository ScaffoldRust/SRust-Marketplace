HoldBackContract
A Soroban smart contract for a Stellar-based marketplace implementing a holdback guarantee to ensure quality and manage disputes.
🌟 Features
💰 Holdback Payment System

Configurable Holdback: Set percentage of payment held in escrow
Flexible Release: Time-based or buyer-approved release
Secure Escrow: Funds locked until conditions are met

🤝 Buyer-Seller Protection

Clear Terms: Transparent holdback rate and release period
Dispute Resolution: Admin-mediated refunds or releases
Mutual Safeguards: Protects both parties from non-compliance

🔄 Transaction Processing

Payment Tracking: Monitor transaction status and holdback
Automatic Release: Time-based release after deadline
Event Emission: Transparent logging of all actions

🛡️ Risk Management

Dispute Handling: Buyer-initiated disputes with admin resolution
Cancellation: Refund option for unresolved disputes
Deadline Enforcement: Strict holdback release timing

🏗️ Architecture
File Structure
src/
├── lib.rs                 # Main contract interface
├── error.rs               # Error definitions
├── storage.rs             # Data storage utilities
└── test.rs                # Comprehensive test suite

🚀 Getting Started
Prerequisites

Rust 1.70+
Soroban CLI
Stellar account with testnet tokens

Building the Contract
# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Build with Soroban CLI
soroban contract build

Testing
# Run the test suite
cargo test

📖 Usage
1. Initialize Contract
contract.initialize(env, admin_address)

2. Create Payment
let transaction_id = contract.create_payment(
    env,
    buyer_address,
    seller_address,
    token_address,
    amount,
    holdback_rate,
    holdback_days,
);

3. Approve Release (Buyer)
contract.approve_release(env, transaction_id, buyer_address);

4. Initiate Dispute (Buyer)
contract.initiate_dispute(env, transaction_id, buyer_address);

5. Resolve Dispute (Admin)
contract.resolve_dispute(env, transaction_id, refund, admin_address);

6. Check and Release
contract.check_and_release(env, transaction_id);

🔄 Contract Workflow

Payment Creation: Buyer initiates payment with holdback terms
Holdback Period: Funds held until release conditions met
Release Options: Buyer approves early release or time-based release
Dispute Process: Buyer initiates dispute; admin resolves with refund or release
Completion: Transaction finalized or cancelled

📊 Contract States



Status
Description
Available Actions



Held
Payment created, holdback in escrow
Approve, Dispute, Check/Release


HoldbackPending
Buyer approved release
Check/Release


Disputed
Dispute initiated
Resolve (Admin)


Completed
Holdback released
View Only


Cancelled
Funds refunded
View Only


🛡️ Security Features

Authorization: require_auth() for all sensitive actions
State Validation: Strict state machine for valid transitions
Fund Protection: Escrow ensures secure holdback management
Event Logging: Transparent events for all major actions

📚 Test Coverage
Tests cover:

Contract initialization
Payment creation with holdback
Buyer-approved and time-based releases
Dispute initiation and resolution
Edge cases (invalid inputs, unauthorized actions, non-existent transactions)
