
#![no_std]

mod test;

use soroban_sdk::{contract, contracttype, contracterror, contractimpl, symbol_short, Address, Env, Symbol, Vec, String };
use soroban_sdk::testutils::arbitrary::std::println;

const ADMIN: Symbol = symbol_short!("i_p_admin"); // length cannot be more than 9, hence, i = installment, p = payment,


#[contracterror]
#[derive(Debug, Clone, PartialEq)]
pub enum ContractError {

    AlreadyInstantiated = 1,
}
#[contract]
pub struct InstallmentPayment;


#[contracttype]
pub struct PaidHistory {
    pub amount: u128,
    pub timeline: u128,
}


#[contracttype]
pub struct InstallmentAgreement {
    pub id: u128,
    pub buyer: Address,
    pub seller: Address,

    pub is_accepted: bool,
    pub creator: Address,

    pub amount_paid: u128,
    pub paid_history: Vec<PaidHistory>,
    pub total_amount: u128,

    pub deadline: u128,

    pub escrow_id: u128,
    pub escrow_address: u128,

    pub is_finalized: bool,

    pub is_canceled: bool,
    pub description: String,

    pub arbitrator: Address,
}



#[contractimpl]
impl InstallmentPayment {

    // initialize the contract
    // @params: env of type Env is the environment variable from soroban
    // @params: admin which would act as the owner of this contract
    pub fn initialize(env: Env, admin: Address ) -> Result<Address, ContractError> {

        // we only want to create just one admin inn this contract
        let admin_exist: bool = env.storage().persistent().has(&ADMIN);
        println!("admin exist {:p}, {:#}", &admin_exist, &admin_exist);
        if admin_exist {
             return Err(ContractError::AlreadyInstantiated);
            // panic!("");
        }
        // check auth
        admin.require_auth();
        env.storage().persistent().set(&ADMIN, &admin);
        Ok(admin)
    }

    pub fn create_installment_agreement(env: Env, seller: Address, buyer: Address, amount: u128, deadline: u128, arbitrator: Address, escrow: Address) -> bool {

        true
    }
    
    pub fn pay_on_installment(env: Env, buyer_address: Address, installment_amount: u128, agreement_id: u128) -> Result<bool, ContractError> {
        Ok(true)
    }

    pub fn finalize_agreement(env: Env, agreement_id: u128, ) -> Result<bool, ContractError> {

        Ok(true)
    }

    pub fn accept_installment_agreement(env: Env, buyer: Address, accept_agreement: bool ) -> Result<bool, ContractError> {

        Ok(true)
    }
}