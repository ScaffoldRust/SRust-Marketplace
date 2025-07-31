use soroban_sdk::{symbol_short, Address, Env,};

/// Emits an event when a new transaction is started.
pub fn transaction_started(env: &Env, transaction_id: u64, buyer: &Address, seller: &Address, total_amount: i128) {
    let topics = (symbol_short!("started"), buyer.clone(), seller.clone());
    let data = (transaction_id, total_amount);
    env.events().publish(topics, data);
}

/// Emits an event when a deposit is made.
pub fn deposit_made(env: &Env, transaction_id: u64, buyer: &Address, amount: i128) {
    let topics = (symbol_short!("deposit"), buyer.clone());
    let data = (transaction_id, amount);
    env.events().publish(topics, data);
}

/// Emits an event when a payment is claimed by the seller.
pub fn payment_claimed(env: &Env, transaction_id: u64, seller: &Address, amount: i128) {
    let topics = (symbol_short!("claimed"), seller.clone());
    let data = (transaction_id, amount);
    env.events().publish(topics, data);
}

/// Emits an event when a refund is issued to the buyer.
pub fn refund_issued(env: &Env, transaction_id: u64, buyer: &Address, amount: i128) {
    let topics = (symbol_short!("refund"), buyer.clone());
    let data = (transaction_id, amount);
    env.events().publish(topics, data);
}

/// Emits an event when a transaction is cancelled.
pub fn transaction_cancelled(env: &Env, transaction_id: u64, canceller: &Address) {
    let topics = (symbol_short!("cancelled"), canceller.clone());
    env.events().publish(topics, transaction_id);
}
