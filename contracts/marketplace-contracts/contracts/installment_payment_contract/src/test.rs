



#[cfg(test)]
mod test {

    use soroban_sdk::{
        testutils::Address as _,
        Address, Env
    };
    use crate::{
        InstallmentPayment, InstallmentPaymentClient, ContractError
    };

    fn create_contract_variables() -> (Env, Address, Address ) {
        let env: Env = Env::default();
        env.mock_all_auths();

        let contract_address: Address = env.register(InstallmentPayment, {});
        let mocked_address: Address = Address::generate(&env);

        return (env, contract_address, mocked_address);
    }
    #[test]
    fn test_initialized_contract() {
        // register the contract

        let(env, contract_address, admin) = create_contract_variables();
        // env.register_contract(None, InstallmentPayment); the register contract method of the env has been deprecated

        let installment_payment_instance = InstallmentPaymentClient::new(&env, &contract_address); // the client with the new function return the instance of the contract
        // installment_payment_instance
        let initialized_result = installment_payment_instance.initialize(&admin);

        assert_eq!(initialized_result, admin)
    }

    #[test]
    #[should_panic]
    fn test_cannot_initialize_more_than_once() {
        let(env, contract_address, admin) = create_contract_variables();
        // env.register_contract(None, InstallmentPayment); the register contract method of the env has been deprecated

        let installment_payment_instance = InstallmentPaymentClient::new(&env, &contract_address); // the client with the new function return the instance of the contract
        // installment_payment_instance
        // let contract_instance = installment_payment_instance.initialize(&admin);

        installment_payment_instance.initialize(&admin);
        installment_payment_instance.initialize(&admin);
    }

    #[test]
    fn test_buyer_pay_on_installment(){
        let (env, contract_address, mocked_address) = create_contract_variables();

        let installed_payment_instance = InstallmentPaymentClient::new(&env, &contract_address);

        let buyer_address: Address = Address::generate(&env);
        let installment_amount: u128 = 1000;

        let result: bool = installed_payment_instance.pay_on_installment(&buyer_address, &installment_amount);

        assert_eq!(result, true);
    }
}