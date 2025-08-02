# Automatic Marketplace Fee Deduction Smart Contract

## Overview

This Soroban smart contract implements an automatic marketplace fee deduction system for Stellar-based marketplaces. It ensures that a predefined fee is automatically deducted from transactions and transferred to a designated marketplace account, providing transparent and secure fee collection.

## Features

### Core Functionality
- **Automatic Fee Deduction**: Automatically deducts marketplace fees from transactions
- **Secure Distribution**: Transfers fees to marketplace account and remaining amount to seller atomically
- **Transparency**: Provides clear transaction breakdowns with detailed event logging
- **Fee Management**: Supports dynamic fee percentage updates by the marketplace owner

### Security & Error Handling
- **Input Validation**: Validates transaction amounts, fee percentages, and addresses
- **Access Control**: Only authorized users can update fee settings
- **Atomic Operations**: Ensures all transfers complete successfully or fail together
- **Comprehensive Error Handling**: Detailed error codes for different failure scenarios

## Contract Interface

### Initialization
```rust
initialize(fee_percentage: u32, fee_recipient: Address) -> Result<(), Error>
```
- `fee_percentage`: Fee in basis points (e.g., 250 = 2.5%, max 1000 = 10%)
- `fee_recipient`: Address that will receive marketplace fees

### Transaction Processing
```rust
process_transaction(
    buyer: Address,
    seller: Address, 
    total_amount: i128,
    token: Address
) -> Result<TransactionDetails, Error>
```
Processes a marketplace transaction with automatic fee deduction.

### Utility Functions
```rust
calculate_fee(amount: i128) -> Result<(i128, i128), Error>
get_config() -> Result<MarketplaceConfig, Error>
update_fee_percentage(new_fee_percentage: u32) -> Result<(), Error>
```

## Data Types

### MarketplaceConfig
```rust
pub struct MarketplaceConfig {
    pub fee_percentage: u32,     // Fee percentage in basis points
    pub fee_recipient: Address,  // Address that receives fees
    pub is_initialized: bool,    // Initialization status
}
```

### TransactionDetails
```rust
pub struct TransactionDetails {
    pub total_amount: i128,
    pub fee_amount: i128,
    pub seller_amount: i128,
    pub buyer: Address,
    pub seller: Address,
    pub token: Address,
}
```

### Error Codes
```rust
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    UnauthorizedAccess = 3,
    InsufficientFunds = 4,
    InvalidFeePercentage = 5,
    TransferFailed = 6,
    InvalidAmount = 7,
}
```

## Usage Examples

### 1. Initialize the Contract
```rust
// Initialize with 2.5% fee
let marketplace_address = Address::from_string("GABC...");
contract.initialize(250, marketplace_address);
```

### 2. Process a Transaction
```rust
let buyer = Address::from_string("GBUYER...");
let seller = Address::from_string("GSELLER...");
let token = Address::from_string("GTOKEN...");

let result = contract.process_transaction(
    buyer,
    seller,
    10_000,  // 10,000 token units
    token
);

// Result breakdown:
// - Fee amount: 250 (2.5% of 10,000)
// - Seller receives: 9,750
// - Marketplace receives: 250
```

### 3. Calculate Fees
```rust
let (fee_amount, seller_amount) = contract.calculate_fee(10_000);
// fee_amount = 250, seller_amount = 9,750
```

### 4. Update Fee Percentage
```rust
// Only marketplace owner can update fees
contract.update_fee_percentage(300); // Change to 3%
```

## Testing

The contract includes comprehensive unit tests covering:

- **Successful Operations**: Normal transaction processing, fee calculations
- **Edge Cases**: Zero amounts, maximum fees, rounding scenarios  
- **Error Conditions**: Invalid inputs, unauthorized access, insufficient funds
- **State Management**: Initialization, configuration updates

Run tests with:
```bash
cargo test
```

## Building & Deployment

### Build for Development
```bash
cargo build
```

### Build for Production
```bash
cargo build --target wasm32-unknown-unknown --release
```

### Deploy to Testnet
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/automatic_marketplace_fee_deduction.wasm \
  --source-account <YOUR_ACCOUNT> \
  --network testnet
```

## Implementation Details

### Fee Calculation
- Fees are calculated using basis points (1/10000)
- Formula: `fee_amount = (total_amount * fee_percentage) / 10000`
- Supports fee percentages from 0% to 10% (0-1000 basis points)

### Atomic Transfers
The contract ensures atomic execution:
1. Validates all inputs and authorization
2. Calculates fee and seller amounts
3. Transfers fee to marketplace (if > 0)
4. Transfers remaining amount to seller
5. Emits transaction event
6. Returns transaction details

### Event Logging
All transactions emit detailed events for transparency:
- Total transaction amount
- Fee amount deducted
- Amount transferred to seller
- Buyer and seller addresses

## Security Considerations

- **Access Control**: Fee updates require authorization from current fee recipient
- **Input Validation**: All amounts and percentages are validated
- **Integer Overflow**: Uses i128 for amounts to prevent overflow
- **Atomic Operations**: All transfers succeed or fail together
- **Maximum Fee Cap**: Enforces 10% maximum fee to prevent abuse

## License

This contract is part of the SRust-Marketplace project.