#[cfg(test)]
mod test {

    use crate::{ContractError, InstallmentPayment, InstallmentPaymentClient};
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    fn create_contract_variables() -> (Env, Address, Address) {
        let env: Env = Env::default();
        env.mock_all_auths();

        let contract_address: Address = env.register(InstallmentPayment, {});
        let mocked_address: Address = Address::generate(&env);

        return (env, contract_address, mocked_address);
    }
    #[test]
    fn test_initialized_contract() {
        // register the contract

        let (env, contract_address, admin) = create_contract_variables();
        // env.register_contract(None, InstallmentPayment); the register contract method of the env has been deprecated

        let installment_payment_instance = InstallmentPaymentClient::new(&env, &contract_address); // the client with the new function return the instance of the contract
                                                                                                   // installment_payment_instance
        let initialized_result = installment_payment_instance.initialize(&admin);

        assert_eq!(initialized_result, admin)
    }

    #[test]
    #[should_panic]
    fn test_cannot_initialize_more_than_once() {
        let (env, contract_address, admin) = create_contract_variables();
        // env.register_contract(None, InstallmentPayment); the register contract method of the env has been deprecated

        let installment_payment_instance = InstallmentPaymentClient::new(&env, &contract_address); // the client with the new function return the instance of the contract
                                                                                                   // installment_payment_instance
                                                                                                   // let contract_instance = installment_payment_instance.initialize(&admin);

        installment_payment_instance.initialize(&admin);
        installment_payment_instance.initialize(&admin);
    }

    #[test]
    fn test_create_an_installment() {
        let (env, contract_address, mocked_address) = create_contract_variables();

        let installed_payment_instance = InstallmentPaymentClient::new(&env, &contract_address);

        let seller: Address = Address::generate(&env);
        let buyer: Address = Address::generate(&env);

        let deadline: u64 = env.ledger().timestamp() + 100;
        let description: String = String::from_str(&env, "agreement btw A and B");
        let amount: u128 = 80;
        let token: Address = Address::generate(&env);


        installed_payment_instance.create_installment_agreement(&seller, &buyer, &amount, &deadline, &mocked_address, &token, &description);

        let optional_installment = installed_payment_instance.get_installment_agreement(&1);

        assert!(optional_installment.is_some());
    }

    #[test]
    fn test_create_multiple_installment() {
        let (env, contract_address, mocked_address) = create_contract_variables();

        let installed_payment_instance = InstallmentPaymentClient::new(&env, &contract_address);

        let seller: Address = Address::generate(&env);
        let buyer: Address = Address::generate(&env);

        let deadline: u64 = env.ledger().timestamp() + 100;
        let description: String = String::from_str(&env, "agreement btw A and B");
        let amount: u128 = 80;
        let token: Address = Address::generate(&env);


        installed_payment_instance.create_installment_agreement(&seller, &buyer, &amount, &deadline, &mocked_address, &token, &description);

        // let optional_installment = installed_payment_instance.get_installment_agreement(&1);

        // assert!(optional_installment.is_some());

        installed_payment_instance.create_installment_agreement(&seller, &buyer, &100, &deadline, &mocked_address, &token, &description);

        let optional_installment = installed_payment_instance.get_installment_agreement(&2);

        assert!(optional_installment.is_some());

        let installment = optional_installment.unwrap();

        assert_eq!(installment.total_amount, 100);

        // cannot get an agreement that the id does not exixst
        let optional_installment = installed_payment_instance.get_installment_agreement(&3);

        assert!(optional_installment.is_none());

    }


    #[test]
    // #[should_panic]
    fn test_accept_installment_agreement() {

        let (env, contract_address, mocked_address) = create_contract_variables();

        let installed_payment_instance = InstallmentPaymentClient::new(&env, &contract_address);

        let seller: Address = Address::generate(&env);
        let buyer: Address = Address::generate(&env);

        let deadline: u64 = env.ledger().timestamp() + 100;
        let description: String = String::from_str(&env, "agreement btw A and B");
        let amount: u128 = 80;
        let token: Address = Address::generate(&env);


        installed_payment_instance.create_installment_agreement(&seller, &buyer, &amount, &deadline, &mocked_address, &token, &description);

        let optional_installment = installed_payment_instance.get_installment_agreement(&1);
        let installment = optional_installment.unwrap();

        assert_eq!(installment.is_accepted, false);


        installed_payment_instance.accept_installment_agreement(&seller, &true, &1);

        // get the state
        let optional_installment = installed_payment_instance.get_installment_agreement(&1);
        let installment = optional_installment.unwrap();

        assert_eq!(installment.is_accepted, true);
    }

    // #[test]
    // fn test_finalized
}
