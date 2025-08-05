use soroban_sdk::{symbol_short, Address, Env, String};

/// Emits an event when a new escrow is created and funded.
pub fn escrow_created(env: &Env, escrow_id: u64, buyer: &Address, seller: &Address, amount: i128) {
    let topics = (symbol_short!("created"), buyer.clone(), seller.clone());
    let data = (escrow_id, amount);
    env.events().publish(topics, data);
}

/// Emits an event when a buyer confirms receipt.
pub fn receipt_confirmed(env: &Env, escrow_id: u64, buyer: &Address) {
    let topics = (symbol_short!("confirmed"), buyer.clone());
    env.events().publish(topics, escrow_id);
}

/// Emits an event when funds are released to the seller.
pub fn funds_released(env: &Env, escrow_id: u64, seller: &Address, amount: i128) {
    let topics = (symbol_short!("released"), seller.clone());
    let data = (escrow_id, amount);
    env.events().publish(topics, data);
}

/// Emits an event when an escrow is disputed by the buyer.
pub fn escrow_disputed(env: &Env, escrow_id: u64, buyer: &Address, reason: String) {
    let topics = (symbol_short!("disputed"), buyer.clone());
    let data = (escrow_id, reason);
    env.events().publish(topics, data);
}

/// Emits an event when a dispute is resolved and funds are refunded.
pub fn funds_refunded(env: &Env, escrow_id: u64, buyer: &Address, amount: i128) {
    let topics = (symbol_short!("refunded"), buyer.clone());
    let data = (escrow_id, amount);
    env.events().publish(topics, data);
}

/// Emits an event when the admin is changed.
pub fn admin_changed(env: &Env, old_admin: &Address, new_admin: &Address) {
    let topics = (symbol_short!("set_admin"), old_admin.clone());
    env.events().publish(topics, new_admin.clone());
}
