#[cfg(test)]
mod test {

    use crate::{entities::*, hold_back_contract::*};

    use soroban_sdk::{
        testutils::{Address as _, Ledger},
        token::{self, StellarAssetClient},
        Address, Env,
    };

    fn create_variables() -> (Env, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();
        // register the contract
        let contract_address = env.register(HoldBackContract, {});
        let mocked_address = Address::generate(&env);

        (env, contract_address, mocked_address)
    }

    fn create_token(env: &Env, admin: &Address) -> (Address, StellarAssetClient<'static>) {
        let client = env.register_stellar_asset_contract_v2(admin.clone());
        (
            client.address(),
            token::StellarAssetClient::new(&env, &client.address()),
        )
    }

    fn create_variables_and_initialize_contract() -> (Env, HoldBackContractClient<'static>, Address)
    {
        let (env, contract_address, mocked_address) = create_variables();

        let contract_instance = HoldBackContractClient::new(&env, &contract_address);

        contract_instance.initialize(&mocked_address);

        (env, contract_instance, mocked_address)
    }

    fn generate_addresses(env: &Env) -> (Address, Address, Address, Address) {
        (
            Address::generate(env),
            Address::generate(env),
            Address::generate(env),
            Address::generate(env),
        )
    }
    //"initialize the contract"
    #[test]
    fn test_initialize_contract() {
        let (env, contract_address, mocked_address) = create_variables();

        let contract_instance = HoldBackContractClient::new(&env, &contract_address);

        assert_eq!(contract_instance.initialize(&mocked_address), true, "error");

        assert_eq!(contract_instance.get_admin(), mocked_address);
    }

    #[test]
    fn test_create_payment() {
        let (env, contract_instance, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

        let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);

        let transaction_id =
            contract_instance.create_payment(&buyer, &seller, &1000, &token_address, &20, &7);
        let transaction = contract_instance.get_transaction(&transaction_id);

        assert_eq!(transaction.buyer, buyer);
        assert_eq!(transaction.seller, seller);
        assert_eq!(transaction.amount, 1000);
        assert_eq!(transaction.holdback_rate, 20);
        assert_eq!(transaction.holdback_amount, 200);
        assert_eq!(transaction.final_amount, 800);
        assert_eq!(transaction.status, TransactionStatus::Held);
        assert_eq!(transaction.token, token_address);
    }

    #[test]
    fn test_approve_release() {
        let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

        let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);

        let transaction_id =
            contract.create_payment(&buyer, &seller, &1000, &token_address, &20, &7);

        contract.approve_release(&transaction_id, &buyer);
        let transaction = contract.get_transaction(&transaction_id);
        assert_eq!(transaction.status, TransactionStatus::Completed);
    }

    #[test]
    fn test_time_based_release() {
        let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

        let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
        let transaction_id =
            contract.create_payment(&buyer, &seller, &1000, &token_address, &20, &1);

        env.ledger().set_timestamp(DAY_IN_SECONDS + 1);

        contract.check_and_release(&transaction_id);
        let transaction = contract.get_transaction(&transaction_id);
        assert_eq!(transaction.status, TransactionStatus::Completed);
    }

    #[test]
    fn test_dispute_and_refunded() {
        let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

        let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);

        let transaction_id =
            contract.create_payment(&buyer, &seller, &1000, &token_address, &20, &7);

        contract.initiate_dispute(&transaction_id, &buyer);
        contract.resolve_dispute(&transaction_id, &true, &admin);

        let transaction = contract.get_transaction(&transaction_id);
        assert_eq!(transaction.status, TransactionStatus::Cancelled);
    }

    #[test]
    #[should_panic]
    fn test_invalid_transaction() {
        let (_, contract, _) = create_variables_and_initialize_contract();

        contract.get_transaction(&999);
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_approve() {
        let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

        let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
        let transaction_id =
            contract.create_payment(&buyer, &seller, &1000, &token_address, &20, &7);

        contract.approve_release(&transaction_id, &seller);
    }

    #[test]
    #[should_panic]
    fn test_invalid_amount() {
        let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

        let (token_address, _) = create_token(&env, &admin);
        contract.create_payment(&buyer, &seller, &1000, &token_address, &20, &7);
    }
    #[test]
    #[should_panic]
    fn test_invalid_holdback_rate() {
        let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

        let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
        contract.create_payment(&buyer, &seller, &1000, &token_address, &0, &7);
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_dispute() {
        let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

        let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
        let transaction_id =
            contract.create_payment(&buyer, &seller, &1000, &token_address, &20, &7);

        contract.initiate_dispute(&transaction_id, &seller);
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_resolve_dispute() {
        let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

        let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
        let transaction_id =
            contract.create_payment(&buyer, &seller, &1000, &token_address, &20, &7);

        contract.initiate_dispute(&transaction_id, &buyer);
        contract.resolve_dispute(&transaction_id, &true, &buyer);
    }

    #[test]
    #[should_panic]
    fn test_approve_invalid_status() {
        let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

        let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
        let transaction_id =
            contract.create_payment(&buyer, &seller, &1000, &token_address, &20, &7);

        contract.initiate_dispute(&transaction_id, &buyer);
        contract.approve_release(&transaction_id, &buyer);
    }

    #[test]
    #[should_panic]
    fn test_buyer_is_seller() {
        let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, _, _, _) = generate_addresses(&env);

        let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
        contract.create_payment(&buyer, &buyer, &1000, &token_address, &20, &7);
    }

    #[test]
    #[should_panic]
    fn test_buyer_is_admin() {
        let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

        let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
        contract.create_payment(&admin, &seller, &1000, &token_address, &20, &7);
    }

    #[test]
    #[should_panic]
    fn test_seller_is_token() {
        let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, _, _, _) = generate_addresses(&env);

        let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
        contract.create_payment(&buyer, &token_address, &1000, &token_address, &20, &7);
    }
}
