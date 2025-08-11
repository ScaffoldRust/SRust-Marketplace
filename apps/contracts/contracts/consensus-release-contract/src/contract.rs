use crate::{
    error::ContractError,
    events,
    storage::{self, add_user_transaction, get_transaction, increment_transaction_counter, save_transaction},
    types::{ConsensusRule, ConsensusTransaction, TransactionStatus},
    utils,
};
use soroban_sdk::{token, Address, Env, String, Vec};

pub fn create_transaction(
    env: &Env,
    buyer: &Address,
    seller: &Address,
    arbitrator: Option<Address>,
    token: &Address,
    amount: i128,
    description: String,
    consensus_rule: ConsensusRule,
    deadline_duration: u64,
) -> Result<u64, ContractError> {
    // Input validation
    if amount <= 0 {
        return Err(ContractError::InvalidAmount);
    }

    if deadline_duration == 0 {
        return Err(ContractError::InvalidDeadline);
    }

    if buyer == seller {
        return Err(ContractError::DuplicateParties);
    }

    if let Some(ref arb) = arbitrator {
        if arb == buyer || arb == seller {
            return Err(ContractError::DuplicateParties);
        }
    }

    // Validate consensus rule with arbitrator
    if consensus_rule == ConsensusRule::WithArbitrator && arbitrator.is_none() {
        return Err(ContractError::ArbitratorRequired);
    }

    let current_time = env.ledger().timestamp();
    let deadline = current_time + deadline_duration;

    if deadline <= current_time {
        return Err(ContractError::InvalidDeadline);
    }

    // Generate transaction ID
    let transaction_id = increment_transaction_counter(env);

    // Create new transaction
    let transaction = utils::create_consensus_transaction(
        env,
        transaction_id,
        buyer.clone(),
        seller.clone(),
        arbitrator.clone(),
        token.clone(),
        amount,
        description,
        consensus_rule.clone(),
        deadline,
    );

    // Save transaction
    save_transaction(env, &transaction)?;

    // Add to user transaction lists
    add_user_transaction(env, buyer, transaction_id)?;
    add_user_transaction(env, seller, transaction_id)?;
    if let Some(ref arb) = arbitrator {
        add_user_transaction(env, arb, transaction_id)?;
    }

    // Emit event
    let event = events::TransactionCreatedEvent {
        transaction_id,
        buyer: buyer.clone(),
        seller: seller.clone(),
        arbitrator: arbitrator.clone(),
        token: token.clone(),
        amount,
        consensus_rule,
        deadline,
    };
    events::emit_transaction_created(env, event);

    Ok(transaction_id)
}

pub fn fund_transaction(env: &Env, buyer: &Address, transaction_id: u64) -> Result<(), ContractError> {
    let mut transaction = get_transaction(env, transaction_id)?;

    // Verify caller is the buyer
    if buyer != &transaction.buyer {
        return Err(ContractError::NotAuthorized);
    }

    // Check transaction status
    if transaction.status != TransactionStatus::Created {
        return Err(ContractError::TransactionAlreadyFunded);
    }

    // Check if transaction is expired
    let current_time = env.ledger().timestamp();
    if utils::is_expired(&transaction, current_time) {
        transaction.status = TransactionStatus::Expired;
        save_transaction(env, &transaction)?;
        
        let event = events::TransactionExpiredEvent {
            transaction_id,
            deadline: transaction.deadline,
            timestamp: current_time,
        };
        events::emit_transaction_expired(env, event);
        
        return Err(ContractError::TransactionExpired);
    }

    // Transfer funds to contract
    let token_client = token::Client::new(env, &transaction.token);
    token_client.transfer(buyer, &env.current_contract_address(), &transaction.amount);

    // Update transaction status
    let old_status = transaction.status.clone();
    transaction.status = TransactionStatus::Funded;
    save_transaction(env, &transaction)?;

    // Emit events
    let funded_event = events::TransactionFundedEvent {
        transaction_id,
        buyer: buyer.clone(),
        amount: transaction.amount,
        timestamp: current_time,
    };
    events::emit_transaction_funded(env, funded_event);

    let status_event = events::TransactionStatusChangedEvent {
        transaction_id,
        old_status,
        new_status: transaction.status.clone(),
        timestamp: current_time,
    };
    events::emit_transaction_status_changed(env, status_event);

    Ok(())
}

pub fn submit_agreement(
    env: &Env,
    party: &Address,
    transaction_id: u64,
    agreed: bool,
    reason: Option<String>,
) -> Result<(), ContractError> {
    let mut transaction = get_transaction(env, transaction_id)?;
    let current_time = env.ledger().timestamp();

    // Check if transaction is expired
    if utils::is_expired(&transaction, current_time) {
        transaction.status = TransactionStatus::Expired;
        save_transaction(env, &transaction)?;
        
        let event = events::TransactionExpiredEvent {
            transaction_id,
            deadline: transaction.deadline,
            timestamp: current_time,
        };
        events::emit_transaction_expired(env, event);
        
        return Err(ContractError::TransactionExpired);
    }

    // Verify party can submit agreement
    if !utils::can_submit_agreement(&transaction, party) {
        return Err(ContractError::NotAuthorizedParty);
    }

    // Check if already agreed
    if transaction.agreements.contains_key(party.clone()) {
        return Err(ContractError::AgreementAlreadySubmitted);
    }

    // Add agreement
    utils::add_agreement(&mut transaction, party.clone(), agreed, reason.clone(), current_time);

    // Check for rejection
    if !agreed {
        transaction.status = TransactionStatus::Refunded;
        save_transaction(env, &transaction)?;

        // Refund buyer
        let token_client = token::Client::new(env, &transaction.token);
        token_client.transfer(&env.current_contract_address(), &transaction.buyer, &transaction.amount);

        // Emit events
        let rejection_event = events::ConsensusRejectedEvent {
            transaction_id,
            rejecting_party: party.clone(),
            timestamp: current_time,
        };
        events::emit_consensus_rejected(env, rejection_event);

        let refund_event = events::FundsRefundedEvent {
            transaction_id,
            buyer: transaction.buyer.clone(),
            amount: transaction.amount,
            reason: reason.unwrap_or_else(|| String::from_str(env, "Party rejected agreement")),
            timestamp: current_time,
        };
        events::emit_funds_refunded(env, refund_event);

        return Ok(());
    }

    // Check for consensus
    if utils::has_consensus(&transaction) {
        transaction.status = TransactionStatus::ConsensusReached;
        
        // Emit consensus reached event
        let consensus_event = events::ConsensusReachedEvent {
            transaction_id,
            timestamp: current_time,
            consensus_type: transaction.consensus_rule.clone(),
        };
        events::emit_consensus_reached(env, consensus_event);
    }

    save_transaction(env, &transaction)?;

    // Emit agreement submitted event
    let agreement_event = events::AgreementSubmittedEvent {
        transaction_id,
        party: party.clone(),
        agreed,
        reason,
        timestamp: current_time,
    };
    events::emit_agreement_submitted(env, agreement_event);

    Ok(())
}

pub fn release_funds(env: &Env, caller: Address, transaction_id: u64) -> Result<(), ContractError> {
    let mut transaction = get_transaction(env, transaction_id)?;
    let current_time = env.ledger().timestamp();

    // Check if transaction is expired
    if utils::is_expired(&transaction, current_time) {
        transaction.status = TransactionStatus::Expired;
        save_transaction(env, &transaction)?;
        
        let event = events::TransactionExpiredEvent {
            transaction_id,
            deadline: transaction.deadline,
            timestamp: current_time,
        };
        events::emit_transaction_expired(env, event);
        
        return Err(ContractError::TransactionExpired);
    }

    // Verify caller is authorized (any party in the transaction)
    if !transaction.required_parties.iter().any(|p| p == caller) {
        return Err(ContractError::NotAuthorized);
    }

    // Check transaction status
    if transaction.status != TransactionStatus::ConsensusReached {
        return Err(ContractError::ConsensusNotReached);
    }

    // Double-check consensus
    if !utils::has_consensus(&transaction) {
        return Err(ContractError::ConsensusNotReached);
    }

    // Transfer funds to seller
    let token_client = token::Client::new(env, &transaction.token);
    token_client.transfer(&env.current_contract_address(), &transaction.seller, &transaction.amount);

    // Update transaction status
    let old_status = transaction.status.clone();
    transaction.status = TransactionStatus::Released;
    save_transaction(env, &transaction)?;

    // Emit events
    let release_event = events::FundsReleasedEvent {
        transaction_id,
        seller: transaction.seller.clone(),
        amount: transaction.amount,
        timestamp: current_time,
    };
    events::emit_funds_released(env, release_event);

    let status_event = events::TransactionStatusChangedEvent {
        transaction_id,
        old_status,
        new_status: transaction.status.clone(),
        timestamp: current_time,
    };
    events::emit_transaction_status_changed(env, status_event);

    Ok(())
}

pub fn handle_expiration(env: &Env, transaction_id: u64) -> Result<(), ContractError> {
    let mut transaction = get_transaction(env, transaction_id)?;
    let current_time = env.ledger().timestamp();

    // Check if actually expired
    if !utils::is_expired(&transaction, current_time) {
        return Err(ContractError::InvalidTimestamp);
    }

    // Can only handle expiration if not already released or refunded
    if transaction.status == TransactionStatus::Released || 
       transaction.status == TransactionStatus::Refunded ||
       transaction.status == TransactionStatus::Expired {
        return Err(ContractError::InvalidTransactionStatus);
    }

    // Update status to expired
    let old_status = transaction.status.clone();
    transaction.status = TransactionStatus::Expired;

    // If funds were deposited, refund to buyer
    if old_status == TransactionStatus::Funded || 
       old_status == TransactionStatus::ConsensusReached {
        transaction.status = TransactionStatus::Refunded;
        
        let token_client = token::Client::new(env, &transaction.token);
        token_client.transfer(&env.current_contract_address(), &transaction.buyer, &transaction.amount);

        let refund_event = events::FundsRefundedEvent {
            transaction_id,
            buyer: transaction.buyer.clone(),
            amount: transaction.amount,
            reason: String::from_str(env, "Transaction expired"),
            timestamp: current_time,
        };
        events::emit_funds_refunded(env, refund_event);
    }

    save_transaction(env, &transaction)?;

    // Emit events
    let expired_event = events::TransactionExpiredEvent {
        transaction_id,
        deadline: transaction.deadline,
        timestamp: current_time,
    };
    events::emit_transaction_expired(env, expired_event);

    let status_event = events::TransactionStatusChangedEvent {
        transaction_id,
        old_status,
        new_status: transaction.status.clone(),
        timestamp: current_time,
    };
    events::emit_transaction_status_changed(env, status_event);

    Ok(())
}

pub fn get_transaction_details(env: &Env, transaction_id: u64) -> Result<ConsensusTransaction, ContractError> {
    get_transaction(env, transaction_id)
}

pub fn get_user_transactions(env: &Env, user: &Address) -> Vec<u64> {
    storage::get_user_transactions(env, user)
}