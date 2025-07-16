use core::ops::Add;

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token::TokenClient, Address,
    Env, String, Symbol, Vec,
};

#[contracttype]
pub struct PaidHistory {
    pub amount: u128,
    pub timeline: u64,
}

#[contracttype]
pub struct InstallmentAgreement {
    pub id: u128,
    pub buyer: Address,
    pub seller: Address,

    pub is_accepted: bool,

    pub amount_paid: u128,
    pub paid_history: Vec<PaidHistory>,
    pub total_amount: u128,

    pub deadline: u64,

    pub is_finalized: bool,

    pub is_canceled: bool,

    pub arbitrator: Address,
    pub description: String,

    pub token: Address,
}

impl InstallmentAgreement {
    pub fn new(
        env: &Env,
        id: u128,
        buyer: Address,
        seller: Address,
        amount: u128,
        deadline: u64,
        arbitrator: Address,
        description: String,
        token: Address,
    ) -> Self {
        Self {
            id,
            buyer,
            seller,
            total_amount: amount,
            is_accepted: false,
            amount_paid: 0,
            paid_history: Vec::new(&env),
            deadline: env.ledger().timestamp() + deadline,
            is_finalized: false,
            is_canceled: false,
            arbitrator,
            description,
            token,
        }
    }
}
