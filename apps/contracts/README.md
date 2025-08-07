# SRust Marketplace Smart Contracts

A collection of Soroban smart contracts built with Rust for the Stellar blockchain, designed to power a decentralized marketplace with advanced escrow capabilities, payment scheduling, and dispute resolution mechanisms.

## Overview

This repository contains a suite of specialized smart contracts that enable secure, trustless transactions between buyers and sellers in a decentralized marketplace. Each contract addresses specific use cases and transaction patterns commonly needed in e-commerce and service marketplaces.

## Project Structure

```
contracts/
├── conditional-refund-contract/     # Escrow with automated refund conditions
├── deferred-settlement-contract/    # Delayed payment processing
├── escrow-arbitration-contract/     # Third-party arbitration for disputes
├── example-contract/                # Simple hello world example
├── installment-payment-contract/    # Scheduled payments over time
├── milestone-payment-contract/      # Progress-based payment releases
├── multisign-escrow-contract/       # Multi-signature escrow
├── mutual-cancellation-contract/    # Cooperative transaction cancellation
├── staggered-payment-contract/      # Time-based payment scheduling
└── timelock-contract/               # Time-locked token deposits
└── hold_back_contract/               # Hold a portion of the payment temporarily 
```

## Contract Descriptions

### Conditional Refund Contract
Enables secure escrow with automated refund capabilities based on predefined conditions, such as delivery deadlines or quality requirements. Ideal for e-commerce transactions where buyer protection is essential.

### Deferred Settlement Contract
Facilitates delayed payment processing with verification conditions. Perfect for transactions that require confirmation periods or waiting for external events before settlement.

### Escrow Arbitration Contract
Implements a three-party escrow system with a neutral arbitrator who can resolve disputes between buyers and sellers. Essential for high-value transactions or services.

### Installment Payment Contract
Manages scheduled payments over time, allowing buyers to pay in multiple installments while providing sellers with guarantees. Suitable for subscription services or large purchases.

### Milestone Payment Contract
Controls the release of funds based on project progress, with funds released as milestones are completed and approved. Ideal for freelance work and service contracts.

### Multisign Escrow Contract
Requires multiple signatures to release funds, providing additional security for high-value transactions or multi-party agreements.

### Mutual Cancellation Contract
Enables cooperative transaction cancellation with built-in refund mechanisms when both parties agree to terminate a transaction.

### Staggered Payment Contract
Implements time-based payment scheduling with verification steps, suitable for service contracts with regular deliverables.

### Timelock Contract
Creates time-locked token deposits that cannot be withdrawn until a specified time has elapsed, with optional clawback mechanisms.

### Holdback COntract
 This contract ensures that a portion of the payment is held back temporarily after the transaction is completed, serving as a guarantee to incentivize quality and reduce potential disputes. The holdback amount is released only after a predefined period or condition, such as buyer approval or the absence of disputes.


## Getting Started

### Prerequisites
- Rust 1.70+
- Soroban CLI
- Stellar account with testnet tokens

### Building the Contracts

```bash
# Build all contracts
cargo build

# Build optimized WASM files for deployment
stellar contract build
```

### Running Tests

```bash
# Run all tests
cargo test
```

## Contract Testing Coverage

All contracts include comprehensive test suites that verify their functionality, security, and edge cases. The test coverage ensures that contracts behave as expected in various scenarios.

## Security Features

- **Authorization Controls**: All contracts implement strict permission checks
- **State Validation**: Contracts validate state transitions to prevent invalid operations
- **Deadline Enforcement**: Time-based conditions are strictly enforced
- **Fund Protection**: Escrowed funds are protected from unauthorized access

## Documentation

Each contract directory contains its own README with detailed documentation on:
- Contract functionality and use cases
- Function descriptions
- Usage examples
- Security considerations

## Development

This project follows the recommended structure for Soroban projects. Each contract has its own directory with:
- Source code in `src/`
- Tests in `src/test.rs`
- Contract-specific `Cargo.toml`
- Documentation in `README.md`

## License

This project is licensed under the MIT License - see the LICENSE file for details.