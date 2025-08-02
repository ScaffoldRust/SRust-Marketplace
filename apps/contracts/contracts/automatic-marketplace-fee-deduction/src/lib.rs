#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol,
};

pub use errors::Error;
pub use events::{emit_marketplace_fee_deduction_fee_initialized, emit_transaction_processed};

// Data types for contract storage and parameters
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MarketplaceConfig {
    pub fee_percentage: u32, // Fee percentage in basis points (e.g., 250 = 2.5%)
    pub fee_recipient: Address, // Address that receives marketplace fees
    pub is_initialized: bool, // Whether contract has been initialized
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TransactionDetails {
    pub total_amount: i128,
    pub fee_amount: i128,
    pub seller_amount: i128,
    pub buyer: Address,
    pub seller: Address,
    pub token: Address,
}

// Storage keys
const CONFIG: Symbol = symbol_short!("CONFIG");

#[contract]
pub struct MarketplaceFeeContract;

#[contractimpl]
impl MarketplaceFeeContract {
    /// Initialize the marketplace contract with fee configuration
    pub fn initialize(env: Env, fee_percentage: u32, fee_recipient: Address) -> Result<(), Error> {
        // Check if already initialized
        if env.storage().instance().has(&CONFIG) {
            return Err(Error::AlreadyInitialized);
        }

        // Validate fee percentage (max 10% = 1000 basis points)
        if fee_percentage > 1000 {
            return Err(Error::InvalidFeePercentage);
        }

        // Require authentication from fee recipient
        fee_recipient.require_auth();

        let config = MarketplaceConfig {
            fee_percentage,
            fee_recipient: fee_recipient.clone(),
            is_initialized: true,
        };

        env.storage().instance().set(&CONFIG, &config);

        emit_marketplace_fee_deduction_fee_initialized(&env, fee_percentage, fee_recipient);

        Ok(())
    }

    /// Process a marketplace transaction with automatic fee deduction
    pub fn process_transaction(
        env: Env,
        buyer: Address,
        seller: Address,
        total_amount: i128,
        token: Address,
    ) -> Result<TransactionDetails, Error> {
        // Require buyer authentication
        buyer.require_auth();

        // Get marketplace configuration
        let config: MarketplaceConfig = env
            .storage()
            .instance()
            .get(&CONFIG)
            .ok_or(Error::NotInitialized)?;

        // Validate transaction amount
        if total_amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        // Calculate fee and seller amount
        let fee_amount = (total_amount * config.fee_percentage as i128) / 10000;
        let seller_amount = total_amount - fee_amount;

        // Validate amounts
        if seller_amount <= 0 {
            return Err(Error::InsufficientFunds);
        }

        // Get token client for transfers
        let token_client = token::Client::new(&env, &token);

        // Transfer fee to marketplace
        if fee_amount > 0 {
            token_client.transfer(&buyer, &config.fee_recipient, &fee_amount);
        }

        // Transfer remaining amount to seller
        token_client.transfer(&buyer, &seller, &seller_amount);

        let transaction_details = TransactionDetails {
            total_amount,
            fee_amount,
            seller_amount,
            buyer: buyer.clone(),
            seller: seller.clone(),
            token: token.clone(),
        };

        // Emit transaction event
        emit_transaction_processed(&env, transaction_details.clone());

        Ok(transaction_details)
    }

    /// Get current marketplace configuration
    pub fn get_config(env: Env) -> Result<MarketplaceConfig, Error> {
        env.storage()
            .instance()
            .get(&CONFIG)
            .ok_or(Error::NotInitialized)
    }

    /// Update marketplace fee percentage (only fee recipient can do this)
    pub fn update_fee_percentage(env: Env, new_fee_percentage: u32) -> Result<(), Error> {
        let mut config: MarketplaceConfig = env
            .storage()
            .instance()
            .get(&CONFIG)
            .ok_or(Error::NotInitialized)?;

        // Require authentication from current fee recipient
        config.fee_recipient.require_auth();

        // Validate new fee percentage
        if new_fee_percentage > 1000 {
            return Err(Error::InvalidFeePercentage);
        }

        config.fee_percentage = new_fee_percentage;
        env.storage().instance().set(&CONFIG, &config);

        emit_marketplace_fee_deduction_fee_initialized(
            &env,
            new_fee_percentage,
            config.fee_recipient,
        );

        Ok(())
    }

    /// Calculate fee for a given amount without processing transaction
    pub fn calculate_fee(env: Env, amount: i128) -> Result<(i128, i128), Error> {
        let config: MarketplaceConfig = env
            .storage()
            .instance()
            .get(&CONFIG)
            .ok_or(Error::NotInitialized)?;

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let fee_amount = (amount * config.fee_percentage as i128) / 10000;
        let seller_amount = amount - fee_amount;

        Ok((fee_amount, seller_amount))
    }
}

mod errors;
mod events;
mod test;
