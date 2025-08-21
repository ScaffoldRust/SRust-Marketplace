use crate::types::{ConsensusTransaction, DataKey};
use soroban_sdk::{Address, Env, Vec};

const INSTANCE_LIFETIME_THRESHOLD: u32 = 518400; // 30 days
const INSTANCE_BUMP_AMOUNT: u32 = 1036800;       // 60 days

pub fn get_transaction(env: &Env, transaction_id: u64) -> Result<ConsensusTransaction, crate::error::ContractError> {
    let key = DataKey::Transaction(transaction_id);
    env.storage()
        .persistent()
        .get(&key)
        .ok_or(crate::error::ContractError::TransactionNotFound)
}

pub fn save_transaction(env: &Env, transaction: &ConsensusTransaction) -> Result<(), crate::error::ContractError> {
    let key = DataKey::Transaction(transaction.transaction_id);
    env.storage().persistent().set(&key, transaction);
    env.storage()
        .persistent()
        .extend_ttl(&key, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
    Ok(())
}

pub fn get_transaction_counter(env: &Env) -> u64 {
    env.storage()
        .persistent()
        .get(&DataKey::TransactionCounter)
        .unwrap_or(0)
}

pub fn increment_transaction_counter(env: &Env) -> u64 {
    let counter = get_transaction_counter(env) + 1;
    env.storage()
        .persistent()
        .set(&DataKey::TransactionCounter, &counter);
    env.storage()
        .persistent()
        .extend_ttl(&DataKey::TransactionCounter, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
    counter
}

pub fn get_user_transactions(env: &Env, user: &Address) -> Vec<u64> {
    let key = DataKey::UserTransactions(user.clone());
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| soroban_sdk::vec![env])
}

pub fn add_user_transaction(env: &Env, user: &Address, transaction_id: u64) -> Result<(), crate::error::ContractError> {
    let key = DataKey::UserTransactions(user.clone());
    let mut transactions = get_user_transactions(env, user);
    transactions.push_back(transaction_id);
    env.storage().persistent().set(&key, &transactions);
    env.storage()
        .persistent()
        .extend_ttl(&key, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
    Ok(())
}

pub fn has_admin(env: &Env) -> bool {
    env.storage().persistent().has(&DataKey::Admin)
}

pub fn get_admin(env: &Env) -> Result<Address, crate::error::ContractError> {
    env.storage()
        .persistent()
        .get(&DataKey::Admin)
        .ok_or(crate::error::ContractError::AdminNotSet)
}

pub fn set_admin(env: &Env, admin: &Address) -> Result<(), crate::error::ContractError> {
    env.storage().persistent().set(&DataKey::Admin, admin);
    env.storage()
        .persistent()
        .extend_ttl(&DataKey::Admin, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
    Ok(())
}