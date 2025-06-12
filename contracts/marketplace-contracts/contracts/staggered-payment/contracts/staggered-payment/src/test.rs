#[cfg(test)]
mod test_ {
    use crate::staggered_payments::{StaggeredPaymentContract, StaggeredPaymentContractClient};
    use crate::storage_types::{DataKey, Transactions, TIMEOUT};
    use soroban_sdk::testutils::{Address as _, Events, Ledger};
    use soroban_sdk::token::Client;
    use soroban_sdk::{symbol_short, vec};
    use soroban_sdk::{
        testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation, LedgerInfo},
        token, Address, BytesN, Env, IntoVal, Symbol,
    };

    use soroban_sdk::log;
    use soroban_sdk::{FromVal, Val, Vec};
    // Helper to create a token contract for testing
    fn create_token_contract<'a>(
        e: &Env,
        admin: &Address,
    ) -> (Address, token::StellarAssetClient<'a>) {
        let contract_address = e.register_stellar_asset_contract_v2(admin.clone());
        (
            contract_address.address(),
            token::StellarAssetClient::new(e, &contract_address.address()),
        )
    }

    // Helper to create test users with initial token balance
    fn create_user(
        env: &Env,
        token: &token::StellarAssetClient,
        admin: &Address,
        amount: i128,
    ) -> Address {
        let user = Address::generate(env);

        token.mint(&user, &amount);
        token.mint(admin, &amount);
        user
    }

    fn setup_env() -> (
        Env,
        StaggeredPaymentContractClient<'static>,
        Address,
        Address,
        Address,
    ) {
        let env = Env::default();

        env.mock_all_auths();
        let admin = Address::generate(&env);

        // Get both the token address and the StellarAssetClient from create_token_contract
        let (token_address, token_client) = create_token_contract(&env, &admin);
        let contract_id = env.register(StaggeredPaymentContract, ());

        // Create a buyer Address
        let _buyer = soroban_sdk::Address::generate(&env);
        // Pass the token_client (StellarAssetClient) instead of _buyer (Address)
        let buyer = create_user(&env, &token_client, &admin, 10000);
        let contract = StaggeredPaymentContractClient::new(&env, &contract_id);
        contract.initialize(&token_address);
        let seller = soroban_sdk::Address::generate(&env);
        let token = token_address;
        (env, contract, buyer, seller, token)
    }

    fn get_contract_events(
        env: &Env,
        _client: &StaggeredPaymentContractClient,
    ) -> Vec<(soroban_sdk::Address, Vec<Val>, Val)> {
        let events = env.events().all();
        log!(env, "events inside get_contract_events: {:?}", events);
        events
    }

    #[test]
    fn test_event_emission() {
        let (env, client, buyer, seller, _) = setup_env();

        env.mock_all_auths();

        let tx_id = client.create_transaction(
            &buyer,
            &seller,
            &1000,
            &vec![&env, 50, 50],
            &vec![&env, symbol_short!("design"), symbol_short!("develop")],
        );

        let events = get_contract_events(&env, &client);
        log!(&env, "Events in test_event_emission: {:?}", events);

        assert!(tx_id >= 1, "Transaction ID should be 1");

        // Find the 'new_tx' event specifically
        let new_tx_event = events.iter().find(|event| {
            // Check if the event source is the contract
            let contract_address_val: Val = client.address.clone().into_val(&env);
            event.0 == Address::from_val(&env, &contract_address_val) &&
            // Check if topics start with 'new_tx'
            !event.1.is_empty() &&
            Symbol::from_val(&env, &event.1.get(0).unwrap()) == symbol_short!("new_tx")
        });

        assert!(
            new_tx_event.is_some(),
            "Expected a 'new_tx' event to be emitted."
        );

        let event = new_tx_event.unwrap();
        let topics = &event.1;
        let topic0: Symbol = Symbol::from_val(&env, &topics.get(0).unwrap());
        let topic1: u32 = u32::from_val(&env, &topics.get(1).unwrap());

        assert_eq!(
            topic0,
            symbol_short!("new_tx"),
            "Topic 0 should be 'new_tx'"
        );
        assert_eq!(topic1, tx_id, "Topic 1 should be the transaction ID");

        let data = &event.2;
        let (event_buyer, event_seller, event_total_amount): (Address, Address, i128) =
            FromVal::from_val(&env, data);
        assert_eq!(event_buyer, buyer);
        assert_eq!(event_seller, seller);
        assert_eq!(event_total_amount, 1000);
    }
}
