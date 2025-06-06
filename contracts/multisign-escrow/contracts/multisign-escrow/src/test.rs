#![cfg(test)]

use super::*;
use soroban_sdk::{Env ,Address ,
    testutils::{Address as _, MockAuth, MockAuthInvoke},
    IntoVal, Symbol,token::{Client ,TokenClient}
};
use crate::escrow::{EscrowContract , EscrowContractClient};
use crate::datatypes::{EscrowStatus};

fn create_client<'a>(env: &'a Env) -> EscrowContractClient<'a> {
    let contract_id = env.register_contract(None, EscrowContract);
    EscrowContractClient::new(env, &contract_id)
}

#[test]
fn test_initialize_success() {
    let env = Env::default();
    let client = create_client(&env);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    let mediator = Some(Address::generate(&env));
    let token = Address::generate(&env);

    let result = client.initialize(
        &buyer,
        &seller,
        &mediator,
        &token,
        &1000,
        &2,
        &1_000_000,
    );

    assert_eq!(result, ());
    let state = client.get_state();
    assert_eq!(state.buyer, buyer);
    assert_eq!(state.seller, seller);
    assert_eq!(state.mediator, mediator);
    assert_eq!(state.amount, 1000);
    assert_eq!(state.required_approvals, 2);
    assert_eq!(state.status, EscrowStatus::Initialized);
}
