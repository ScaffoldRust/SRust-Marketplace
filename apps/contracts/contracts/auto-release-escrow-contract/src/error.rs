use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    // State Errors
    AlreadyInitialized = 1,
    ReleaseTimeNotPassed = 2,
    EscrowNotActive = 3,
    EscrowAlreadyDisputed = 4,
    EscrowNotDisputed = 5,

    // Authorization Errors
    NotAdmin = 6,
    NotBuyer = 7,

    // Data Errors
    EscrowNotFound = 8,
    InvalidAmount = 9,
    InvalidReleaseTime = 10,
}
