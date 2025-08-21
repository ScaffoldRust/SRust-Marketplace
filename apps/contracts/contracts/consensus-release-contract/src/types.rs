use soroban_sdk::{contracttype, Address, Map, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ConsensusTransaction {
    pub transaction_id: u64,
    pub buyer: Address,
    pub seller: Address,
    pub arbitrator: Option<Address>,
    pub token: Address,
    pub amount: i128,
    pub description: soroban_sdk::String,
    pub status: TransactionStatus,
    pub consensus_rule: ConsensusRule,
    pub deadline: u64,
    pub created_at: u64,
    pub agreements: Map<Address, Agreement>,
    pub required_parties: Vec<Address>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TransactionStatus {
    Created,
    Funded,
    ConsensusReached,
    Released,
    Refunded,
    Expired,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ConsensusRule {
    Unanimous,           // All parties must agree
    Majority,           // More than 50% must agree
    BuyerSellerOnly,    // Only buyer and seller need to agree (ignores arbitrator)
    WithArbitrator,     // Buyer, seller, and arbitrator must all agree
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Agreement {
    pub party: Address,
    pub agreed: bool,
    pub timestamp: u64,
    pub reason: Option<soroban_sdk::String>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Transaction(u64),
    TransactionCounter,
    UserTransactions(Address),
    Admin,
}