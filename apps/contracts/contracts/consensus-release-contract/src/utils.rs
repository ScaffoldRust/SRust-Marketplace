use crate::types::{Agreement, ConsensusRule, ConsensusTransaction, TransactionStatus};
use soroban_sdk::{Address, Env, Map};

pub fn create_consensus_transaction(
    env: &Env,
    transaction_id: u64,
    buyer: Address,
    seller: Address,
    arbitrator: Option<Address>,
    token: Address,
    amount: i128,
    description: soroban_sdk::String,
    consensus_rule: ConsensusRule,
    deadline: u64,
) -> ConsensusTransaction {
    let mut required_parties = soroban_sdk::vec![env, buyer.clone(), seller.clone()];
    
    if let Some(ref arb) = arbitrator {
        if consensus_rule == ConsensusRule::WithArbitrator || consensus_rule == ConsensusRule::Unanimous {
            required_parties.push_back(arb.clone());
        }
    }

    ConsensusTransaction {
        transaction_id,
        buyer,
        seller,
        arbitrator,
        token,
        amount,
        description,
        status: TransactionStatus::Created,
        consensus_rule,
        deadline,
        created_at: env.ledger().timestamp(),
        agreements: Map::new(env),
        required_parties,
    }
}

pub fn add_agreement(
    transaction: &mut ConsensusTransaction, 
    party: Address, 
    agreed: bool, 
    reason: Option<soroban_sdk::String>, 
    timestamp: u64
) {
    let agreement = Agreement {
        party: party.clone(),
        agreed,
        timestamp,
        reason,
    };
    transaction.agreements.set(party, agreement);
}

pub fn has_consensus(transaction: &ConsensusTransaction) -> bool {
    match transaction.consensus_rule {
        ConsensusRule::Unanimous => {
            transaction.required_parties.iter().all(|party| {
                transaction.agreements.get(party).map_or(false, |agreement| agreement.agreed)
            })
        }
        ConsensusRule::Majority => {
            let total_parties = transaction.required_parties.len() as u32;
            let agreed_count = transaction.required_parties.iter()
                .filter(|party| {
                    transaction.agreements.get(party.clone()).map_or(false, |agreement| agreement.agreed)
                })
                .count() as u32;
            agreed_count > total_parties / 2
        }
        ConsensusRule::BuyerSellerOnly => {
            transaction.agreements.get(transaction.buyer.clone()).map_or(false, |agreement| agreement.agreed) &&
            transaction.agreements.get(transaction.seller.clone()).map_or(false, |agreement| agreement.agreed)
        }
        ConsensusRule::WithArbitrator => {
            if let Some(ref arbitrator) = transaction.arbitrator {
                transaction.agreements.get(transaction.buyer.clone()).map_or(false, |agreement| agreement.agreed) &&
                transaction.agreements.get(transaction.seller.clone()).map_or(false, |agreement| agreement.agreed) &&
                transaction.agreements.get(arbitrator.clone()).map_or(false, |agreement| agreement.agreed)
            } else {
                false // Can't have WithArbitrator rule without an arbitrator
            }
        }
    }
}

pub fn _has_rejection(transaction: &ConsensusTransaction) -> bool {
    transaction.required_parties.iter().any(|party| {
        transaction.agreements.get(party).map_or(false, |agreement| !agreement.agreed)
    })
}

pub fn is_expired(transaction: &ConsensusTransaction, current_timestamp: u64) -> bool {
    current_timestamp > transaction.deadline
}

pub fn can_submit_agreement(transaction: &ConsensusTransaction, party: &Address) -> bool {
    transaction.required_parties.iter().any(|p| p == *party) && 
    transaction.status == TransactionStatus::Funded
}