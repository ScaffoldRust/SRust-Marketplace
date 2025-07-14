



#[cfg(test)]
mod test {

use soroban_sdk::{
        testutils::Address as _,
        Address, Env
    };
    use crate::{
        InstallmentPayment, InstallmentPaymentClient, ContractError
    };
    #[test]
    fn test_initialized_contract() {
        // register the contract

        let env: Env = Env::default();
        env.mock_all_auths();
        let contract_id: Address = env.register(InstallmentPayment, {});
        // env.register_contract(None, InstallmentPayment); the register contract method of the env has been deprecated

        let installment_payment_instance = InstallmentPaymentClient::new(&env, &contract_id); // the client with the new function return the instance of the contract
        // installment_payment_instance
        let admin: Address = Address::generate(&env,);
        let initailized_result = installment_payment_instance.initialize(&admin);

        assert_eq!(initailized_result, admin)
    }
}