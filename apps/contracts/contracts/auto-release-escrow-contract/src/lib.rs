#![no_std]

mod error;
mod escrow_logic;
mod event;
mod storage;
#[cfg(test)]
mod test;

use soroban_sdk::{contract, contractimpl, Address, Env, String};

use crate::{error::ContractError, storage::Escrow};

#[contract]
pub struct AutoReleaseEscrowContract;

#[contractimpl]
impl AutoReleaseEscrowContract {
    /// Initializes the contract with a designated admin address.
    pub fn initialize(env: Env, admin: Address) -> Result<(), ContractError> {
        escrow_logic::initialize(&env, admin)
    }

    /// Allows the current admin to transfer admin rights to a new address.
    pub fn set_admin(env: Env, admin: Address, new_admin: Address) -> Result<(), ContractError> {
        escrow_logic::set_admin(&env, admin, new_admin)
    }

    /// Creates a new escrow agreement and locks the buyer's funds.
    pub fn create_escrow(
        env: Env,
        buyer: Address,
        seller: Address,
        amount: i128,
        payment_token: Address,
        release_timestamp: u64, // The time after which the funds can be released
    ) -> Result<u64, ContractError> {
        escrow_logic::create_escrow(
            &env,
            buyer,
            seller,
            amount,
            payment_token,
            release_timestamp,
        )
    }

    /// Allows the buyer to confirm they have received the goods/service,
    /// enabling an early release of funds.
    pub fn confirm_receipt(env: Env, buyer: Address, escrow_id: u64) -> Result<(), ContractError> {
        escrow_logic::confirm_receipt(&env, buyer, escrow_id)
    }

    /// Releases the funds to the seller if the auto-release time has passed
    /// OR if the buyer has confirmed receipt.
    pub fn release_funds(env: Env, escrow_id: u64) -> Result<(), ContractError> {
        escrow_logic::release_funds(&env, escrow_id)
    }

    /// Allows the buyer to request a refund if there is a dispute.
    pub fn dispute_escrow(
        env: Env,
        buyer: Address,
        escrow_id: u64,
        reason: String,
    ) -> Result<(), ContractError> {
        escrow_logic::dispute_escrow(&env, buyer, escrow_id, reason)
    }

    /// Allows an admin/arbiter to resolve a dispute, refunding the buyer.
    pub fn resolve_dispute_and_refund(
        env: Env,
        admin: Address,
        escrow_id: u64,
    ) -> Result<(), ContractError> {
        escrow_logic::resolve_dispute_and_refund(&env, admin, escrow_id)
    }

    // --- Read-Only Functions ---

    /// Retrieves the details of a specific escrow.
    pub fn get_escrow(env: Env, escrow_id: u64) -> Result<Escrow, ContractError> {
        storage::get_escrow(&env, escrow_id)
    }
}
