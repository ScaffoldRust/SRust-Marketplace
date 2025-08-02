use soroban_sdk::{contracttype, Address, Env};

pub use crate::TransactionDetails;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TransactionProcessedEvent {
    pub total_amount: i128,
    pub fee_amount: i128,
    pub seller_amount: i128,
    pub buyer: Address,
    pub seller: Address,
    pub token: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MarketplaceFeeDeductionFeeInitializedEvent {
    pub fee_percentage: u32,
    pub fee_recipient: Address,
}

pub fn emit_transaction_processed(env: &Env, transaction: TransactionDetails) {
    let event = TransactionProcessedEvent {
        total_amount: transaction.total_amount,
        fee_amount: transaction.fee_amount,
        seller_amount: transaction.seller_amount,
        buyer: transaction.buyer,
        seller: transaction.seller,
        token: transaction.token,
    };
    env.events().publish(("transaction_processed",), event);
}

pub fn emit_marketplace_fee_deduction_fee_initialized(
    env: &Env,
    fee_percentage: u32,
    fee_recipient: Address,
) {
    let event = MarketplaceFeeDeductionFeeInitializedEvent {
        fee_percentage,
        fee_recipient,
    };
    env.events()
        .publish(("marketplace_fee_deduction_fee_initialized",), event);
}
