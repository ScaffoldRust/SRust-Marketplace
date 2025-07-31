use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    // State Errors
    TransactionNotActive = 1,
    TransactionFullyFunded = 2,
    TransactionNotFundedEnough = 3,
    DeadlineNotPassed = 4,
    DeadlinePassed = 5,

    // Authorization Errors
    NotBuyer = 6,
    NotSeller = 7,
    NotParticipant = 8,

    // Data Errors
    TransactionNotFound = 9,
    InvalidAmount = 10,
    InvalidDeadline = 11,
    InvalidInput = 12,
}
