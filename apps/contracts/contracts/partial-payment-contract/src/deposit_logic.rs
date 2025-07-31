use soroban_sdk::{token, Address, Env};

use crate::{
    error::ContractError,
    event,
    storage::{self, Transaction, TransactionStatus},
};

/// Initializes a new transaction and stores it.
pub fn start_transaction(
    env: &Env,
    buyer: Address,
    seller: Address,
    total_amount: i128,
    payment_token: Address,
    deadline: u64,
) -> Result<u64, ContractError> {
    buyer.require_auth();

    if total_amount <= 0 {
        return Err(ContractError::InvalidAmount);
    }
    if deadline <= env.ledger().timestamp() {
        return Err(ContractError::InvalidDeadline);
    }
    if buyer == seller {
        return Err(ContractError::InvalidInput);
    }

    let transaction_id = storage::get_next_transaction_id(env);
    let transaction = Transaction {
        id: transaction_id,
        buyer: buyer.clone(),
        seller: seller.clone(),
        total_amount,
        deposited_amount: 0,
        payment_token,
        deadline,
        status: TransactionStatus::Active,
    };

    storage::set_transaction(env, &transaction);
    event::transaction_started(env, transaction_id, &buyer, &seller, total_amount);

    Ok(transaction_id)
}

/// Allows a buyer to make a partial deposit.
pub fn make_deposit(
    env: &Env,
    buyer: Address,
    transaction_id: u64,
    deposit_amount: i128,
) -> Result<(), ContractError> {
    buyer.require_auth();

    if deposit_amount <= 0 {
        return Err(ContractError::InvalidAmount);
    }

    let mut transaction = storage::get_transaction(env, transaction_id)?;

    if transaction.buyer != buyer {
        return Err(ContractError::NotBuyer);
    }
    if transaction.status != TransactionStatus::Active {
        return Err(ContractError::TransactionNotActive);
    }
    if env.ledger().timestamp() > transaction.deadline {
        return Err(ContractError::DeadlinePassed);
    }

    let token_client = token::Client::new(env, &transaction.payment_token);
    token_client.transfer(&buyer, &env.current_contract_address(), &deposit_amount);

    transaction.deposited_amount += deposit_amount;

    if transaction.deposited_amount >= transaction.total_amount {
        transaction.status = TransactionStatus::Funded;
    }

    storage::set_transaction(env, &transaction);
    event::deposit_made(env, transaction_id, &buyer, deposit_amount);

    Ok(())
}

/// Allows the seller to claim the full payment.
pub fn claim_payment(env: &Env, seller: Address, transaction_id: u64) -> Result<(), ContractError> {
    seller.require_auth();

    let mut transaction = storage::get_transaction(env, transaction_id)?;

    if transaction.seller != seller {
        return Err(ContractError::NotSeller);
    }
    if transaction.status != TransactionStatus::Funded {
        return Err(ContractError::TransactionNotFundedEnough);
    }

    let token_client = token::Client::new(env, &transaction.payment_token);
    token_client.transfer(
        &env.current_contract_address(),
        &seller,
        &transaction.deposited_amount,
    );

    transaction.status = TransactionStatus::Completed;
    storage::set_transaction(env, &transaction);
    event::payment_claimed(env, transaction_id, &seller, transaction.deposited_amount);

    Ok(())
}

/// Allows the buyer to get a refund if the deadline has passed.
pub fn request_refund(
    env: &Env,
    buyer: Address,
    transaction_id: u64,
) -> Result<(), ContractError> {
    buyer.require_auth();

    let mut transaction = storage::get_transaction(env, transaction_id)?;

    if transaction.buyer != buyer {
        return Err(ContractError::NotBuyer);
    }
    if env.ledger().timestamp() <= transaction.deadline {
        return Err(ContractError::DeadlineNotPassed);
    }
    if transaction.status == TransactionStatus::Funded || transaction.status == TransactionStatus::Completed {
        // If fully funded, the deal is locked in. No refunds.
        return Err(ContractError::TransactionFullyFunded);
    }

    let token_client = token::Client::new(env, &transaction.payment_token);
    token_client.transfer(
        &env.current_contract_address(),
        &buyer,
        &transaction.deposited_amount,
    );

    transaction.status = TransactionStatus::Expired;
    storage::set_transaction(env, &transaction);
    event::refund_issued(env, transaction_id, &buyer, transaction.deposited_amount);

    Ok(())
}

/// Allows either party to cancel an underfunded transaction.
pub fn cancel_transaction(
    env: &Env,
    canceller: Address,
    transaction_id: u64,
) -> Result<(), ContractError> {
    canceller.require_auth();

    let mut transaction = storage::get_transaction(env, transaction_id)?;

    if transaction.buyer != canceller && transaction.seller != canceller {
        return Err(ContractError::NotParticipant);
    }
    if transaction.status == TransactionStatus::Funded || transaction.status == TransactionStatus::Completed {
        return Err(ContractError::TransactionFullyFunded);
    }

    if transaction.deposited_amount > 0 {
        let token_client = token::Client::new(env, &transaction.payment_token);
        token_client.transfer(
            &env.current_contract_address(),
            &transaction.buyer,
            &transaction.deposited_amount,
        );
    }

    transaction.status = TransactionStatus::Cancelled;
    storage::set_transaction(env, &transaction);
    event::transaction_cancelled(env, transaction_id, &canceller);

    Ok(())
}
