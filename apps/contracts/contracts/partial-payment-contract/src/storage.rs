use soroban_sdk::{contracttype, Address, Env};

use crate::error::ContractError;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TransactionStatus {
    Active,    // Deposits can be made
    Funded,    // Full amount deposited, waiting for seller to claim
    Completed, // Seller has claimed the funds
    Cancelled, // Cancelled by a participant, funds returned to buyer
    Expired,   // Deadline passed, buyer can claim a refund
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Transaction {
    pub id: u64,
    pub buyer: Address,
    pub seller: Address,
    pub total_amount: i128,
    pub deposited_amount: i128,
    pub payment_token: Address,
    pub deadline: u64,
    pub status: TransactionStatus,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    TransactionCounter,
    Transaction(u64),
}

// --- Storage Helper Functions ---

pub fn get_next_transaction_id(env: &Env) -> u64 {
    let current_id: u64 = env
        .storage()
        .instance()
        .get(&DataKey::TransactionCounter)
        .unwrap_or(0);
    let next_id = current_id + 1;
    env.storage()
        .instance()
        .set(&DataKey::TransactionCounter, &next_id);
    next_id
}

pub fn get_transaction(env: &Env, transaction_id: u64) -> Result<Transaction, ContractError> {
    env.storage()
        .persistent()
        .get(&DataKey::Transaction(transaction_id))
        .ok_or(ContractError::TransactionNotFound)
}

pub fn set_transaction(env: &Env, transaction: &Transaction) {
    env.storage()
        .persistent()
        .set(&DataKey::Transaction(transaction.id), transaction);
}
