use soroban_sdk::{token, Address, Env, String};

use crate::{
    error::ContractError,
    event,
    storage::{self, Escrow, EscrowStatus},
};

/// Initializes the contract with an admin. Can only be called once.
pub fn initialize(env: &Env, admin: Address) -> Result<(), ContractError> {
    if storage::has_admin(env) {
        return Err(ContractError::AlreadyInitialized);
    }
    admin.require_auth();
    storage::set_admin(env, &admin);
    Ok(())
}

/// Allows the current admin to set a new admin.
pub fn set_admin(env: &Env, admin: Address, new_admin: Address) -> Result<(), ContractError> {
    admin.require_auth();
    if !storage::is_admin(env, &admin) {
        return Err(ContractError::NotAdmin);
    }

    storage::set_admin(env, &new_admin);
    event::admin_changed(env, &admin, &new_admin);
    Ok(())
}

/// Creates a new escrow agreement and immediately locks the buyer's funds.
pub fn create_escrow(
    env: &Env,
    buyer: Address,
    seller: Address,
    amount: i128,
    payment_token: Address,
    release_timestamp: u64,
) -> Result<u64, ContractError> {
    buyer.require_auth();

    if amount <= 0 {
        return Err(ContractError::InvalidAmount);
    }
    if release_timestamp <= env.ledger().timestamp() {
        return Err(ContractError::InvalidReleaseTime);
    }

    // Lock the buyer's funds in the contract.
    let token_client = token::Client::new(env, &payment_token);
    token_client.transfer(&buyer, &env.current_contract_address(), &amount);

    let escrow_id = storage::get_next_escrow_id(env);
    let escrow = Escrow {
        id: escrow_id,
        buyer: buyer.clone(),
        seller: seller.clone(),
        amount,
        payment_token,
        release_timestamp,
        status: EscrowStatus::Active,
        dispute_reason: None,
        buyer_confirmed: false,
    };

    storage::set_escrow(env, &escrow);
    event::escrow_created(env, escrow_id, &buyer, &seller, amount);

    Ok(escrow_id)
}

/// Allows the buyer to confirm receipt, setting the confirmation flag to true.
pub fn confirm_receipt(env: &Env, buyer: Address, escrow_id: u64) -> Result<(), ContractError> {
    buyer.require_auth();

    let mut escrow = storage::get_escrow(env, escrow_id)?;

    if escrow.buyer != buyer {
        return Err(ContractError::NotBuyer);
    }
    if escrow.status != EscrowStatus::Active {
        return Err(ContractError::EscrowNotActive);
    }

    escrow.buyer_confirmed = true;
    storage::set_escrow(env, &escrow);
    event::receipt_confirmed(env, escrow_id, &buyer);

    Ok(())
}

/// Releases funds to the seller if the release time has passed OR the buyer has confirmed.
pub fn release_funds(env: &Env, escrow_id: u64) -> Result<(), ContractError> {
    let mut escrow = storage::get_escrow(env, escrow_id)?;

    if escrow.status != EscrowStatus::Active {
        return Err(ContractError::EscrowNotActive);
    }

    let can_release =
        env.ledger().timestamp() >= escrow.release_timestamp || escrow.buyer_confirmed;
    if !can_release {
        return Err(ContractError::ReleaseTimeNotPassed);
    }

    let token_client = token::Client::new(env, &escrow.payment_token);
    token_client.transfer(
        &env.current_contract_address(),
        &escrow.seller,
        &escrow.amount,
    );

    escrow.status = EscrowStatus::Released;
    storage::set_escrow(env, &escrow);
    event::funds_released(env, escrow_id, &escrow.seller, escrow.amount);

    Ok(())
}

/// Allows the buyer to raise a dispute before the release time.
pub fn dispute_escrow(
    env: &Env,
    buyer: Address,
    escrow_id: u64,
    reason: String,
) -> Result<(), ContractError> {
    buyer.require_auth();

    let mut escrow = storage::get_escrow(env, escrow_id)?;

    if escrow.buyer != buyer {
        return Err(ContractError::NotBuyer);
    }
    if escrow.status == EscrowStatus::Disputed {
        return Err(ContractError::EscrowAlreadyDisputed);
    }
    if escrow.status != EscrowStatus::Active {
        return Err(ContractError::EscrowNotActive);
    }

    escrow.status = EscrowStatus::Disputed;
    escrow.dispute_reason = Some(reason.clone());
    storage::set_escrow(env, &escrow);
    event::escrow_disputed(env, escrow_id, &buyer, reason);

    Ok(())
}

/// Allows a designated admin to resolve a dispute by refunding the buyer.
pub fn resolve_dispute_and_refund(
    env: &Env,
    admin: Address,
    escrow_id: u64,
) -> Result<(), ContractError> {
    admin.require_auth();
    if !storage::is_admin(env, &admin) {
        return Err(ContractError::NotAdmin);
    }

    let mut escrow = storage::get_escrow(env, escrow_id)?;

    if escrow.status != EscrowStatus::Disputed {
        return Err(ContractError::EscrowNotDisputed);
    }

    let token_client = token::Client::new(env, &escrow.payment_token);
    token_client.transfer(
        &env.current_contract_address(),
        &escrow.buyer,
        &escrow.amount,
    );

    escrow.status = EscrowStatus::Refunded;
    storage::set_escrow(env, &escrow);
    event::funds_refunded(env, escrow_id, &escrow.buyer, escrow.amount);

    Ok(())
}
