#![no_std]

mod test;

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short,
    token::{self, TokenClient},
    Address, Env, String, Symbol, Vec,
};
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
    AgreementNotFOund = 8,
}
#[contract]
pub struct InstallmentPayment;

#[contracttype]
pub struct PaidHistory {
    pub amount: u128,
    pub timeline: u64,
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
    pub fn initialize(env: Env, admin: Address) -> Result<Address, ContractError> {
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
    pub fn create_installment_agreement(
        env: Env,
        seller: Address,
        buyer: Address,
        amount: u128,
        deadline: u64,
        arbitrator: Address,
        token: Address,
        description: String,
    ) -> Result<bool, ContractError> {
        buyer.require_auth();

        // confirm the deadline and amount
        if amount == 0 {
            return Err(ContractError::InvalidAmount);
        }

        // ensure buyer is not the seller
        if &buyer == &seller {
            return Err(ContractError::DuplicateUsers);
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
            token,
        };

        //save the agreement
        let agreement_key: (u128, Symbol) = (new_agreement_id, AGREEMENT);
        env.storage()
            .persistent()
            .set(&AGREEMENT_ID, &new_agreement_id);

        env.storage()
            .persistent()
            .set(&agreement_key, &install_agreement);

        Ok(true)
    }

    pub fn pay_on_installment(
        env: Env,
        buyer_address: Address,
        installment_amount: u128,
        agreement_id: u128,
    ) -> Result<bool, ContractError> {
        let agreement_key: (u128, Symbol) = (agreement_id, AGREEMENT);

        let installment_agreement_optional: Option<InstallmentAgreement> =
            env.storage().persistent().get(&agreement_key);
        if &installment_agreement_optional.is_none() == &true {
            return Err(ContractError::AgreementNotFOund);
        }

        let mut installment_agreement: InstallmentAgreement =
            installment_agreement_optional.unwrap();

        assert!(
            &installment_agreement.is_accepted,
            "agreement not accepted yet"
        );
        assert!(
            !&installment_agreement.is_canceled,
            "agreement has been cancelled"
        );
        assert!(
            !&installment_agreement.is_finalized,
            "agreement has been finalized"
        );
        assert!(&installment_agreement.deadline > &env.ledger().timestamp());

        assert!(installment_amount > 0, "amount cannot be zero");

        let token_address: Address = installment_agreement.token;

        // create the token client
        let token_contract: TokenClient = token::TokenClient::new(&env, &token_address);
        let user_balance: i128 = token_contract.balance(&buyer_address);

        assert!(
            user_balance >= installment_amount as i128,
            "insufficient balance"
        );

        token_contract.transfer(
            &buyer_address,
            &env.current_contract_address(),
            &(installment_amount as i128),
        );

        // create the payment history
        let payment_history: PaidHistory = PaidHistory {
            amount: installment_amount,
            timeline: env.ledger().timestamp(),
        };
        // update the agreement

        installment_agreement
            .paid_history
            .push_back(payment_history);
        installment_agreement.amount_paid += installment_amount;

        Ok(true)
    }

    pub fn finalize_agreement(env: Env, agreement_id: u128) -> Result<bool, ContractError> {
        Ok(true)
    }

    pub fn accept_installment_agreement(
        env: Env,
        seller: Address,
        accept_agreement: bool,
        agreement_id: u128,
    ) -> Result<bool, ContractError> {
        let agreement: (u128, Symbol) = (agreement_id, AGREEMENT);
        let installment_agreement_optional: Option<InstallmentAgreement> =
            env.storage().persistent().get(&agreement);
        if installment_agreement_optional.is_none() {
            return Err(ContractError::InvalidAgreementId);
        }
        let mut installment_agreement: InstallmentAgreement =
            installment_agreement_optional.unwrap();

        if &seller != &installment_agreement.seller {
            return Err(ContractError::NotAuthorized);
        }

        assert!(!&installment_agreement.is_accepted);
        assert!(!&installment_agreement.is_canceled);
        assert!(!&installment_agreement.is_finalized);

        installment_agreement.is_accepted = accept_agreement;

        env.storage()
            .persistent()
            .set(&agreement, &installment_agreement);

        Ok(true)
    }

    // only seller can cancel the agreement
    pub fn cancel_and_refund_agreement(
        env: Env,
        address: Address,
        agreement_id: u128,
    ) -> Result<bool, ContractError> {
        let agreement_key: (u128, Symbol) = (agreement_id, AGREEMENT);

        let installment_agreement_optional: Option<InstallmentAgreement> =
            env.storage().persistent().get(&agreement_key);
        if installment_agreement_optional.is_none() == true {
            return Err(ContractError::AgreementNotFOund);
        }

        let mut installment_agreement: InstallmentAgreement =
            installment_agreement_optional.unwrap();

        assert!(installment_agreement.is_accepted, "");
        assert!(!installment_agreement.is_canceled, "");
        assert!(!installment_agreement.is_finalized, "");

        assert_eq!(
            installment_agreement.seller, address,
            "only the seller can cancel agreement"
        );

        // change the state to true
        installment_agreement.is_canceled = true;

        // check the total amount paid by the buyer and refund
        let total_installment_amount_paid: u128 = installment_agreement.amount_paid;

        if total_installment_amount_paid > 0 {
            // check if the amount paid is greater than 0
            let token_contract: TokenClient =
                token::TokenClient::new(&env, &installment_agreement.token);

            // call on the token client

            token_contract.transfer(
                &env.current_contract_address(),
                &installment_agreement.buyer,
                &(total_installment_amount_paid as i128),
            );
        }

        //save to the storage
        env.storage()
            .persistent()
            .set(&agreement_key, &installment_agreement);
        Ok(true)
    }

    pub fn get_installment_agreement(env: Env, agreement_id: u128) -> Option<InstallmentAgreement> {
        // Err(String::from_str(&env, ""))
        let agreement_key: (u128, Symbol) = (agreement_id, AGREEMENT);
        env.storage().persistent().get(&agreement_key)
    }
}
