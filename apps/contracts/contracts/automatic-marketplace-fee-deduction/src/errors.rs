use soroban_sdk::contracterror;

// Error types
#[contracterror]
#[derive(Clone, Debug, Copy, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    UnauthorizedAccess = 3,
    InsufficientFunds = 4,
    InvalidFeePercentage = 5,
    TransferFailed = 6,
    InvalidAmount = 7,
}
