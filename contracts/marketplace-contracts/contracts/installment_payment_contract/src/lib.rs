
#![no_std]

mod test;

// use core::ops::Add;
use soroban_sdk::{contract, contracterror, contractimpl, symbol_short, Address, Env, Symbol};
use soroban_sdk::testutils::arbitrary::std::println;

const ADMIN: Symbol = symbol_short!("i_p_admin"); // length cannot be more than 9, hence, i = installment, p = payment,


#[contracterror]
#[derive(Debug, Clone, PartialEq)]
pub enum ContractError {

    AlreadyInstantiated = 1,
}
#[contract]
pub struct InstallmentPayment;



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
}