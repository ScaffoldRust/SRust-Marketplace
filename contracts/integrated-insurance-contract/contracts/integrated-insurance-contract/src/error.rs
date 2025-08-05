use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotAuthorized = 1,
    InsufficientFunds = 2,
    PolicyNotFound = 3,
    PolicyExpired = 4,
    ClaimNotFound = 5,
    ClaimAlreadyProcessed = 6,
    InvalidPremium = 7,
    InvalidCoverage = 8,
    InvalidRiskParameters = 9,
    InsufficientPoolFunds = 10,
    MarketplaceNotIntegrated = 11,
}