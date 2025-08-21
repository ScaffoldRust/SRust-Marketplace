# Smart Contract Test Documentation

This document provides an overview of the test coverage for each smart contract in the SRust Marketplace ecosystem.

## Table of Contents

1. [Conditional Refund Contract](#conditional-refund-contract)
2. [Deferred Settlement Contract](#deferred-settlement-contract)
3. [Escrow Arbitration Contract](#escrow-arbitration-contract)
4. [Example Contract](#example-contract)
5. [Installment Payment Contract](#installment-payment-contract)
6. [Milestone Payment Contract](#milestone-payment-contract)
7. [Multisign Escrow Contract](#multisign-escrow-contract)
8. [Mutual Cancellation Contract](#mutual-cancellation-contract)
9. [Staggered Payment Contract](#staggered-payment-contract)
10. [Timelock Contract](#timelock-contract)
11.  [Holdback Contract](#holdback-contract)

## Conditional Refund Contract

The conditional refund contract tests verify the functionality of an escrow system with automated refund capabilities based on predefined conditions.

### Test Coverage

- Contract initialization
- Creating refund contracts with various parameters
- Funding contracts
- Marking orders as delivered
- Confirming delivery and releasing funds
- Requesting refunds based on conditions
- Processing automatic refunds
- Resolving refund disputes
- Cancelling contracts
- Retrieving contract details and user contracts

## Deferred Settlement Contract

The deferred settlement contract tests verify the functionality of delayed payment processing with verification conditions.

### Test Coverage

- Contract initialization
- Creating transactions
- Handling invalid transaction amounts
- Unauthorized dispute handling
- Oracle confirmation processes
- Time-based condition verification
- Dispute initiation and resolution

## Escrow Arbitration Contract

The escrow arbitration contract tests verify the functionality of a three-party escrow system with arbitration capabilities.

### Test Coverage

- Contract initialization and duplicate initialization prevention
- Creating escrow contracts with validation for same parties
- Deposit functionality and restrictions
- Arbitration processes for disputes
- Dispute raising by different parties
- Fund release mechanisms
- Refund processes
- User escrow pagination
- Authorization checks

## Example Contract

A simple hello world contract with basic test coverage.

### Test Coverage

- Basic functionality test

## Installment Payment Contract

The installment payment contract tests verify the functionality of scheduled payments over time.

### Test Coverage

- Contract initialization
- Creating installment agreements
- Accepting agreements by sellers
- Payment processing on installments
- Handling payments past deadlines
- Cancellation and refund mechanisms
- Agreement finalization

## Milestone Payment Contract

The milestone payment contract tests verify the functionality of progress-based payment releases.

### Test Coverage

- Contract initialization
- Creating contracts with milestones
- Funding contracts
- Completing milestones
- Approving milestones
- Handling disputes
- Contract cancellation
- Contract completion
- Retrieving contract details and milestones
- Authorization checks

## Multisign Escrow Contract

The multisign escrow contract tests verify the functionality of multi-signature escrow systems.

### Test Coverage

- Contract initialization
- Deposit functionality
- Approval mechanisms
- Fund release with sufficient approvals
- Refund processes after deadlines
- State management and retrieval

## Mutual Cancellation Contract

The mutual cancellation contract tests verify the functionality of cooperative transaction cancellation.

### Test Coverage

- No specific tests documented in the test results

## Staggered Payment Contract

The staggered payment contract tests verify the functionality of time-based payment scheduling.

### Test Coverage

- Transaction creation
- Milestone validation
- Timeout handling
- Event emission
- Milestone workflow
- Dispute resolution

## Timelock Contract

The timelock contract tests verify the functionality of time-locked token deposits.

### Test Coverage

- Lock duration settings
- Clawback delay settings
- Deposit functionality and validation
- Withdrawal mechanisms
- Clawback processes
- Authorization checks
- Event emission

## Holdback Contract

The holdback contract tests verify the functionality of a holdback guarantee mechanism for secure marketplace transactions.

### Test Coverage

- Contract initialization
- Creating payments with holdback
- Buyer-approved holdback release
- Time-based holdback release
- Dispute initiation and resolution (refund and release scenarios)
- Handling invalid inputs (amount, holdback rate)
- Unauthorized access prevention
- Invalid state transitions
- Edge cases (buyer as seller/admin, non-existent transactions)

## Running the Tests

To run all tests for all contracts:

```bash
cargo test
```
 
To run tests for a specific contract:

```bash
cargo test -p contract_name
```

For example:

```bash
cargo test -p conditional_refund_contract
```

## Test Coverage Summary

| Contract | Tests | Pass | Fail | Coverage |
|----------|-------|------|------|----------|
| Conditional Refund | N/A | N/A | 0 | High |
| Deferred Settlement | 7 | 7 | 0 | High |
| Escrow Arbitration | 32 | 32 | 0 | High |
| Example Contract | 1 | 1 | 0 | Basic |
| Installment Payment | 11 | 11 | 0 | High |
| Milestone Payment | 38 | 38 | 0 | High |
| Multisign Escrow | 9 | 9 | 0 | High |
| Mutual Cancellation | 0 | 0 | 0 | None |
| Staggered Payment | 6 | 6 | 0 | Medium |
| Timelock | 17 | 17 | 0 | High |
| Holdback | 15 | 15 | 0 | High
