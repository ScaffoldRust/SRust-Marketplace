# Consensus Release Smart Contract

A secure, multi-party consensus-based escrow system built on Stellar using the Soroban SDK. This contract ensures funds are only released when all required parties agree, providing a transparent and trustworthy mechanism for complex transactions.

## Overview

The Consensus Release Contract handles scenarios where funds in escrow should only be released after consensus is reached between multiple parties (buyer, seller, and optional arbitrator). It provides various consensus mechanisms to accommodate different transaction requirements while maintaining security and transparency.

## Features

### 🔐 Multi-Party Consensus
- **Unanimous**: All parties must agree
- **Majority**: More than 50% of parties must agree  
- **Buyer-Seller Only**: Only buyer and seller need to agree (ignores arbitrator)
- **With Arbitrator**: Buyer, seller, and arbitrator must all agree

### 🛡️ Secure Escrow Management
- Funds locked in smart contract until consensus
- Prevention of unauthorized or premature releases
- Automatic refund mechanisms for expired transactions

### ⚖️ Dispute Handling
- Party rejection triggers automatic refund
- Time-based fallback for expired transactions
- Optional arbitrator for complex disputes

### 📊 Event Logging
- Complete transaction lifecycle tracking
- Agreement/rejection notifications
- Fund release and refund events
- Status change notifications

### 🧪 Thoroughly Tested
- Comprehensive unit test coverage
- Edge case validation
- Happy path and failure scenarios

## Contract Architecture

### Core Types

```rust
pub struct ConsensusTransaction {
    pub transaction_id: u64,
    pub buyer: Address,
    pub seller: Address,
    pub arbitrator: Option<Address>,
    pub token: Address,
    pub amount: i128,
    pub description: String,
    pub status: TransactionStatus,
    pub consensus_rule: ConsensusRule,
    pub deadline: u64,
    pub created_at: u64,
    pub agreements: Map<Address, Agreement>,
    pub required_parties: Vec<Address>,
}

pub enum ConsensusRule {
    Unanimous,           // All parties must agree
    Majority,           // More than 50% must agree
    BuyerSellerOnly,    // Only buyer and seller need to agree
    WithArbitrator,     // Buyer, seller, and arbitrator must all agree
}

pub enum TransactionStatus {
    Created,      // Transaction created, awaiting funding
    Funded,       // Funds locked in escrow
    ConsensusReached, // All required parties agreed
    Released,     // Funds released to seller
    Refunded,     // Funds refunded to buyer
    Expired,      // Transaction expired
}
```

### Error Handling

The contract provides comprehensive error handling with specific error codes:

- **Initialization Errors**: Already initialized, admin not set, unauthorized
- **Transaction Errors**: Invalid amount/deadline, duplicate parties, arbitrator issues
- **Status Errors**: Invalid status transitions, expired transactions
- **Agreement Errors**: Unauthorized parties, duplicate submissions
- **Fund Management Errors**: Transfer failures, insufficient funds

## Usage Guide

### 1. Contract Initialization

```rust
// Initialize contract with admin
contract.initialize(admin_address);
```

### 2. Creating a Transaction

```rust
let transaction_id = contract.create_transaction(
    buyer_address,
    seller_address,
    Some(arbitrator_address), // Optional
    token_address,
    amount,                   // Amount in token units
    "Product delivery",       // Description
    ConsensusRule::Unanimous, // Consensus mechanism
    3600                     // Deadline in seconds
);
```

### 3. Funding the Transaction

```rust
// Buyer funds the transaction
contract.fund_transaction(buyer_address, transaction_id);
```

### 4. Submitting Agreements

```rust
// Each party submits their decision
contract.submit_agreement(
    party_address,
    transaction_id,
    true,                    // true = agree, false = reject
    Some("Quality confirmed") // Optional reason
);
```

### 5. Releasing Funds

```rust
// Once consensus is reached, any party can trigger release
contract.release_funds(caller_address, transaction_id);
```

### 6. Handling Expired Transactions

```rust
// Anyone can clean up expired transactions
contract.handle_expiration(transaction_id);
```

## Consensus Rules Explained

### Unanimous Consensus
All parties (buyer, seller, and arbitrator if present) must agree.
```rust
ConsensusRule::Unanimous
```

### Majority Consensus  
More than 50% of involved parties must agree.
```rust
ConsensusRule::Majority
```

### Buyer-Seller Only
Only buyer and seller decisions matter (arbitrator's vote ignored).
```rust
ConsensusRule::BuyerSellerOnly
```

### With Arbitrator
Requires all three parties (buyer, seller, arbitrator) to agree.
```rust
ConsensusRule::WithArbitrator
```

## Event Monitoring

The contract emits detailed events for transparency:

```rust
// Transaction lifecycle events
TransactionCreatedEvent
TransactionFundedEvent
TransactionStatusChangedEvent
TransactionExpiredEvent

// Consensus events
AgreementSubmittedEvent
ConsensusReachedEvent
ConsensusRejectedEvent

// Fund movement events
FundsReleasedEvent
FundsRefundedEvent
```

## Example Workflows

### Happy Path: Successful Transaction

1. **Create**: Buyer creates transaction with seller and arbitrator
2. **Fund**: Buyer deposits funds to contract
3. **Agree**: All parties submit agreements
4. **Release**: Funds automatically released to seller

### Dispute Path: Rejected Transaction

1. **Create**: Transaction created and funded
2. **Disagree**: One party rejects the agreement
3. **Refund**: Funds automatically refunded to buyer

### Expiration Path: Time-Based Refund

1. **Create**: Transaction created and funded
2. **Expire**: Deadline passes without consensus
3. **Cleanup**: Anyone calls `handle_expiration`
4. **Refund**: Funds returned to buyer

## Security Considerations

### ✅ Implemented Safeguards
- Authorization checks for all sensitive operations
- Input validation and sanitization
- Reentrancy protection via status checks
- Time-based expiration handling
- Comprehensive error handling

### 🔒 Best Practices
- Always set reasonable deadlines
- Choose appropriate consensus rules
- Monitor transaction events
- Handle expired transactions promptly
- Validate token addresses and amounts

## Testing

Run the comprehensive test suite:

```bash
cargo test
```

### Test Coverage
- ✅ Contract initialization
- ✅ Transaction creation and validation
- ✅ Fund management
- ✅ All consensus mechanisms
- ✅ Agreement submission and validation
- ✅ Fund release scenarios
- ✅ Rejection and refund flows
- ✅ Expiration handling
- ✅ Admin management
- ✅ Edge cases and error conditions

## Integration Examples

### E-commerce Platform
```rust
// Create escrow for product purchase
let tx_id = contract.create_transaction(
    buyer,
    seller,
    Some(platform_arbitrator),
    usdc_token,
    product_price,
    "Product purchase with quality guarantee",
    ConsensusRule::WithArbitrator,
    7 * 24 * 3600 // 7 days
);
```

### Service Agreement
```rust
// Create milestone-based service payment
let tx_id = contract.create_transaction(
    client,
    freelancer,
    None,
    payment_token,
    service_fee,
    "Website development milestone 1",
    ConsensusRule::BuyerSellerOnly,
    30 * 24 * 3600 // 30 days
);
```

### Complex Business Deal
```rust
// Multi-party business transaction
let tx_id = contract.create_transaction(
    company_a,
    company_b,
    Some(legal_arbitrator),
    stable_token,
    contract_value,
    "Merger agreement conditional release",
    ConsensusRule::Unanimous,
    90 * 24 * 3600 // 90 days
);
```

## API Reference

### Core Functions

- `initialize(admin: Address)` - Initialize contract
- `create_transaction(...)` - Create new consensus transaction
- `fund_transaction(buyer: Address, transaction_id: u64)` - Fund transaction
- `submit_agreement(party: Address, transaction_id: u64, agreed: bool, reason: Option<String>)` - Submit agreement/rejection
- `release_funds(caller: Address, transaction_id: u64)` - Release funds after consensus
- `handle_expiration(transaction_id: u64)` - Handle expired transactions

### Query Functions

- `get_transaction(transaction_id: u64)` - Get transaction details
- `get_user_transactions(user: Address)` - Get user's transaction IDs
- `get_admin()` - Get current admin address
- `get_transaction_counter()` - Get total transaction count

### Admin Functions

- `set_admin(current_admin: Address, new_admin: Address)` - Transfer admin rights

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write comprehensive tests
4. Follow Rust and Soroban best practices
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Create an issue in the repository
- Review the test cases for usage examples
- Check the Soroban documentation for SDK details

---

Built with ❤️ using [Soroban SDK](https://soroban.stellar.org/) on the Stellar blockchain.