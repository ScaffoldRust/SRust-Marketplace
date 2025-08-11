use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    // Initialization Errors
    AlreadyInitialized = 1,
    AdminNotSet = 2,
    NotAuthorized = 3,

    // Transaction Errors
    TransactionNotFound = 10,
    InvalidAmount = 11,
    InvalidDeadline = 12,
    InvalidConsensusRule = 13,
    DuplicateParties = 14,
    ArbitratorRequired = 15,

    // Status Errors
    TransactionNotFunded = 20,
    TransactionAlreadyFunded = 21,
    TransactionExpired = 22,
    TransactionAlreadyReleased = 23,
    TransactionAlreadyRefunded = 24,
    InvalidTransactionStatus = 25,

    // Agreement Errors
    NotAuthorizedParty = 30,
    AgreementAlreadySubmitted = 31,
    ConsensusNotReached = 32,
    ConsensusRejected = 33,

    // Fund Management Errors
    InsufficientFunds = 40,
    TransferFailed = 41,

    // System Errors
    InvalidTimestamp = 50,
    StorageError = 51,
}

impl ContractError {
    pub fn as_u32(&self) -> u32 {
        *self as u32
    }
}