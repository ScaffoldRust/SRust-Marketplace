#![no_std]

mod contract;
mod error;
mod events;
mod storage;
mod types;
mod utils;

#[cfg(test)]
mod test;

use contract::*;
use error::ContractError;
use soroban_sdk::{contract, contractimpl, Address, Env, String, Vec};
use types::{ConsensusRule, ConsensusTransaction};

#[contract]
pub struct ConsensusReleaseContract;

#[contractimpl]
impl ConsensusReleaseContract {
    /// Initialize the contract with an admin
    pub fn initialize(env: Env, admin: Address) -> Result<(), ContractError> {
        if storage::has_admin(&env) {
            return Err(ContractError::AlreadyInitialized);
        }
        admin.require_auth();
        storage::set_admin(&env, &admin)?;
        Ok(())
    }

    /// Create a new consensus transaction
    /// 
    /// # Arguments
    /// * `buyer` - Address of the buyer who will fund the transaction
    /// * `seller` - Address of the seller who will receive funds upon consensus
    /// * `arbitrator` - Optional arbitrator address for dispute resolution
    /// * `token` - Token contract address for the transaction
    /// * `amount` - Amount to be held in escrow
    /// * `description` - Description of the transaction
    /// * `consensus_rule` - Rule defining how consensus is reached
    /// * `deadline_duration` - Time in seconds from now until transaction expires
    pub fn create_transaction(
        env: Env,
        buyer: Address,
        seller: Address,
        arbitrator: Option<Address>,
        token: Address,
        amount: i128,
        description: String,
        consensus_rule: ConsensusRule,
        deadline_duration: u64,
    ) -> Result<u64, ContractError> {
        buyer.require_auth();
        create_transaction(
            &env,
            &buyer,
            &seller,
            arbitrator,
            &token,
            amount,
            description,
            consensus_rule,
            deadline_duration,
        )
    }

    /// Fund a transaction by transferring tokens to escrow
    /// Can only be called by the buyer of the transaction
    pub fn fund_transaction(
        env: Env,
        buyer: Address,
        transaction_id: u64,
    ) -> Result<(), ContractError> {
        buyer.require_auth();
        fund_transaction(&env, &buyer, transaction_id)
    }

    /// Submit agreement or rejection for a transaction
    /// Can be called by any authorized party (buyer, seller, arbitrator)
    /// 
    /// # Arguments
    /// * `party` - Address of the party submitting the agreement
    /// * `transaction_id` - ID of the transaction
    /// * `agreed` - true if agreeing to release funds, false if rejecting
    /// * `reason` - Optional reason for the decision
    pub fn submit_agreement(
        env: Env,
        party: Address,
        transaction_id: u64,
        agreed: bool,
        reason: Option<String>,
    ) -> Result<(), ContractError> {
        party.require_auth();
        submit_agreement(&env, &party, transaction_id, agreed, reason)
    }

    /// Release funds to seller after consensus is reached
    /// Can be called by any authorized party once consensus is achieved
    pub fn release_funds(
        env: Env,
        caller: Address,
        transaction_id: u64,
    ) -> Result<(), ContractError> {
        caller.require_auth();
        release_funds(&env, caller, transaction_id)
    }

    /// Handle expired transactions by refunding buyer if applicable
    /// Can be called by anyone to clean up expired transactions
    pub fn handle_expiration(env: Env, transaction_id: u64) -> Result<(), ContractError> {
        handle_expiration(&env, transaction_id)
    }

    /// Get detailed information about a transaction
    pub fn get_transaction(env: Env, transaction_id: u64) -> Result<ConsensusTransaction, ContractError> {
        get_transaction_details(&env, transaction_id)
    }

    /// Get all transaction IDs associated with a user
    pub fn get_user_transactions(env: Env, user: Address) -> Vec<u64> {
        get_user_transactions(&env, &user)
    }

    /// Get the current admin address
    pub fn get_admin(env: Env) -> Result<Address, ContractError> {
        storage::get_admin(&env)
    }

    /// Transfer admin rights to a new address
    pub fn set_admin(env: Env, current_admin: Address, new_admin: Address) -> Result<(), ContractError> {
        current_admin.require_auth();
        let admin = storage::get_admin(&env)?;
        if admin != current_admin {
            return Err(ContractError::NotAuthorized);
        }
        storage::set_admin(&env, &new_admin)?;
        Ok(())
    }

    /// Get the current transaction counter
    pub fn get_transaction_counter(env: Env) -> u64 {
        storage::get_transaction_counter(&env)
    }
}