use soroban_sdk::{contracttype, Address, Env, String};

use crate::error::ContractError;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    Active,   // Funds are locked, release time is pending
    Released, // Funds have been sent to the seller
    Refunded, // Funds have been returned to the buyer
    Disputed, // Awaiting admin resolution
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Escrow {
    pub id: u64,
    pub buyer: Address,
    pub seller: Address,
    pub amount: i128,
    pub payment_token: Address,
    pub release_timestamp: u64,
    pub status: EscrowStatus,
    pub dispute_reason: Option<String>,
    pub buyer_confirmed: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    EscrowCounter,
    Escrow(u64),
}

// --- Storage Helper Functions ---

pub fn has_admin(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Admin)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

pub fn get_admin(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Admin).unwrap()
}

pub fn is_admin(env: &Env, user: &Address) -> bool {
    get_admin(env) == *user
}

pub fn get_next_escrow_id(env: &Env) -> u64 {
    let current_id: u64 = env
        .storage()
        .instance()
        .get(&DataKey::EscrowCounter)
        .unwrap_or(0);
    let next_id = current_id + 1;
    env.storage()
        .instance()
        .set(&DataKey::EscrowCounter, &next_id);
    next_id
}

pub fn get_escrow(env: &Env, escrow_id: u64) -> Result<Escrow, ContractError> {
    env.storage()
        .persistent()
        .get(&DataKey::Escrow(escrow_id))
        .ok_or(ContractError::EscrowNotFound)
}

pub fn set_escrow(env: &Env, escrow: &Escrow) {
    env.storage()
        .persistent()
        .set(&DataKey::Escrow(escrow.id), escrow);
}
