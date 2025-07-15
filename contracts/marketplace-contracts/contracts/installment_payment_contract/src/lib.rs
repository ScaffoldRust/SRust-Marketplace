
#![no_std]

mod test;

use soroban_sdk::{contract, contracttype, contracterror, contractimpl, symbol_short, Address, Env, Symbol, Vec, String };
// use soroban_sdk::testutils::arbitrary::std::println;

const ADMIN: Symbol = symbol_short!("i_p_admin"); // length cannot be more than 9, hence, i = installment, p = payment,
const AGREEMENT_ID: Symbol = symbol_short!("agree_id");
const AGREEMENT: Symbol = symbol_short!("agreement");


#[contracterror]
#[derive(Debug, Clone, PartialEq)]
pub enum ContractError {

    AlreadyInstantiated = 1,
    InvalidAmount = 2,
    DuplicateUsers = 3,
    ArbitratorNotAllowed = 4,
    InvalidTimestamp = 5,
    InvalidAgreementId = 6,
    NotAuthorized = 7,

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
    
    pub amount_paid: u128,
    pub paid_history: Vec<PaidHistory>,
    pub total_amount: u128,

    pub deadline: u64,

    pub is_finalized: bool,

    pub is_canceled: bool,

    pub arbitrator: Address,
    pub description: String,

    pub token: Address,
}



#[contractimpl]
impl InstallmentPayment {

    // initialize the contract
    // @params: env of type Env is the environment variable from soroban
    // @params: admin which would act as the owner of this contract
    pub fn initialize(env: Env, admin: Address ) -> Result<Address, ContractError> {

        // we only want to create just one admin inn this contract
        let admin_exist: bool = env.storage().persistent().has(&ADMIN);
        // println!("admin exist {:p}, {:#}", &admin_exist, &admin_exist);
        if admin_exist {
             return Err(ContractError::AlreadyInstantiated);
            // panic!("");
        }
        // check auth
        admin.require_auth();
        env.storage().persistent().set(&ADMIN, &admin);
        Ok(admin)
    }

    // since it is the buyer that want to pay on installment , it best we allow buyer to create the agreement then choose list pf Arbitrator provided by the platform
    // if the seller is satisfied with the agreement , the seller accepts/ agree to the agreement which then buyer can start making deposits
    pub fn create_installment_agreement(env: Env, seller: Address, buyer: Address, amount: u128, deadline: u64, arbitrator: Address, token: Address, description: String) -> Result<bool, ContractError> {
        buyer.require_auth();

        // confirm the deadline and amount
        if amount == 0 {
            return Err(ContractError::InvalidAmount);
        }

        // ensure buyer is not the seller
        if &buyer == &seller {
            return  Err(ContractError::DuplicateUsers);
        }

        if &buyer == &arbitrator || &seller == &arbitrator {
            return Err(ContractError::ArbitratorNotAllowed);
        }

        if env.ledger().timestamp() > (env.ledger().timestamp() + deadline) {
            return Err(ContractError::InvalidTimestamp);
        }

        // generate the agreement id
        let agreement_id: u128 = env.storage().persistent().get(&AGREEMENT_ID).unwrap_or(0);
        let new_agreement_id: u128 = agreement_id + 1;

        // create the agreement
        let install_agreement: InstallmentAgreement = InstallmentAgreement {
            id: new_agreement_id,
            buyer,
            seller,
            total_amount: amount,
            is_accepted: false,
            amount_paid: 0,
            paid_history: Vec::new(&env),
            deadline: env.ledger().timestamp(),
            is_finalized: false,
            is_canceled: false,
            arbitrator,
            description,
            token
        };

        //save the agreement
        let agreement_key: (u128, Symbol) =  (new_agreement_id, AGREEMENT);
        env.storage().persistent().set(&AGREEMENT_ID, &new_agreement_id);

        env.storage().persistent().set(&agreement_key, &install_agreement);

        Ok(true)
    }
    
    pub fn pay_on_installment(env: Env, buyer_address: Address, installment_amount: u128, agreement_id: u128) -> Result<bool, ContractError> {
        Ok(true)
    }

    pub fn finalize_agreement(env: Env, agreement_id: u128, ) -> Result<bool, ContractError> {

        Ok(true)
    }

    pub fn accept_installment_agreement(env: Env, seller: Address, accept_agreement: bool, agreement_id: u128 ) -> Result<bool, ContractError> {
        let agreement: (u128 ,Symbol, ) = (agreement_id, AGREEMENT);
        let mut installment_agreement_optional: Option<InstallmentAgreement> = env.storage().persistent().get(&agreement);
        if installment_agreement_optional.is_none() {
            return Err(ContractError::InvalidAgreementId);
        }
        let mut installment_agreement: InstallmentAgreement = installment_agreement_optional.unwrap();
        
        if &seller  != &installment_agreement.seller { 
            return Err(ContractError::NotAuthorized);
        }

        assert!(!&installment_agreement.is_accepted);
        assert!(!&installment_agreement.is_canceled);
        assert!(!&installment_agreement.is_finalized);
        
        installment_agreement.seller = seller;
        
        
        env.storage().persistent().set(&agreement, &installment_agreement);

        Ok(true)
    }

    pub fn cancel_and_refund_agreement(env: Env, address: Address, agreement_id: u128) -> Result<bool, ContractError> {
        Ok(true)
    }
}