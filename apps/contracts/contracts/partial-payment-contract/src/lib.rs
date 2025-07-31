#![no_std]

mod deposit_logic;
mod error;
mod event;
mod storage;
#[cfg(test)]
mod test;

use soroban_sdk::{contract, contractimpl, Address, Env};

use crate::{
    error::ContractError,
    storage::Transaction,
};

#[contract]
pub struct PartialPaymentContract;

#[contractimpl]
impl PartialPaymentContract {
    /// Initializes a new payment transaction between a buyer and a seller.
    pub fn start_transaction(
        env: Env,
        buyer: Address,
        seller: Address,
        total_amount: i128,
        payment_token: Address,
        deadline: u64, // A timestamp by which the full payment must be completed
    ) -> Result<u64, ContractError> {
        deposit_logic::start_transaction(
            &env,
            buyer,
            seller,
            total_amount,
            payment_token,
            deadline,
        )
    }

    /// Allows a buyer to make a partial deposit towards a transaction.
    pub fn make_deposit(
        env: Env,
        buyer: Address,
        transaction_id: u64,
        deposit_amount: i128,
    ) -> Result<(), ContractError> {
        deposit_logic::make_deposit(&env, buyer, transaction_id, deposit_amount)
    }

    /// Allows the seller to claim the full payment once the total amount has been deposited.
    pub fn claim_payment(
        env: Env,
        seller: Address,
        transaction_id: u64,
    ) -> Result<(), ContractError> {
        deposit_logic::claim_payment(&env, seller, transaction_id)
    }

    /// Allows the buyer to request a refund if the payment deadline has passed.
    pub fn request_refund(
        env: Env,
        buyer: Address,
        transaction_id: u64,
    ) -> Result<(), ContractError> {
        deposit_logic::request_refund(&env, buyer, transaction_id)
    }

    /// Allows either party to cancel the transaction before it is fully funded.
    pub fn cancel_transaction(
        env: Env,
        canceller: Address,
        transaction_id: u64,
    ) -> Result<(), ContractError> {
        deposit_logic::cancel_transaction(&env, canceller, transaction_id)
    }

    // --- Read-Only Functions ---

    /// Retrieves the details of a specific transaction.
    pub fn get_transaction(env: Env, transaction_id: u64) -> Result<Transaction, ContractError> {
        storage::get_transaction(&env, transaction_id)
    }
}
