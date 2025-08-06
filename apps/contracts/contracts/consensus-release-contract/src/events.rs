use soroban_sdk::{Address, Env, String, contracttype};
use crate::types::{ConsensusRule, TransactionStatus};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TransactionCreatedEvent {
    pub transaction_id: u64,
    pub buyer: Address,
    pub seller: Address,
    pub arbitrator: Option<Address>,
    pub token: Address,
    pub amount: i128,
    pub consensus_rule: ConsensusRule,
    pub deadline: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TransactionFundedEvent {
    pub transaction_id: u64,
    pub buyer: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AgreementSubmittedEvent {
    pub transaction_id: u64,
    pub party: Address,
    pub agreed: bool,
    pub reason: Option<String>,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ConsensusReachedEvent {
    pub transaction_id: u64,
    pub timestamp: u64,
    pub consensus_type: ConsensusRule,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ConsensusRejectedEvent {
    pub transaction_id: u64,
    pub rejecting_party: Address,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FundsReleasedEvent {
    pub transaction_id: u64,
    pub seller: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FundsRefundedEvent {
    pub transaction_id: u64,
    pub buyer: Address,
    pub amount: i128,
    pub reason: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TransactionStatusChangedEvent {
    pub transaction_id: u64,
    pub old_status: TransactionStatus,
    pub new_status: TransactionStatus,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TransactionExpiredEvent {
    pub transaction_id: u64,
    pub deadline: u64,
    pub timestamp: u64,
}

// Helper functions to emit events
pub fn emit_transaction_created(env: &Env, event: TransactionCreatedEvent) {
    env.events().publish(("transaction_created",), event);
}

pub fn emit_transaction_funded(env: &Env, event: TransactionFundedEvent) {
    env.events().publish(("transaction_funded",), event);
}

pub fn emit_agreement_submitted(env: &Env, event: AgreementSubmittedEvent) {
    env.events().publish(("agreement_submitted",), event);
}

pub fn emit_consensus_reached(env: &Env, event: ConsensusReachedEvent) {
    env.events().publish(("consensus_reached",), event);
}

pub fn emit_consensus_rejected(env: &Env, event: ConsensusRejectedEvent) {
    env.events().publish(("consensus_rejected",), event);
}

pub fn emit_funds_released(env: &Env, event: FundsReleasedEvent) {
    env.events().publish(("funds_released",), event);
}

pub fn emit_funds_refunded(env: &Env, event: FundsRefundedEvent) {
    env.events().publish(("funds_refunded",), event);
}

pub fn emit_transaction_status_changed(env: &Env, event: TransactionStatusChangedEvent) {
    env.events().publish(("transaction_status_changed",), event);
}

pub fn emit_transaction_expired(env: &Env, event: TransactionExpiredEvent) {
    env.events().publish(("transaction_expired",), event);
}