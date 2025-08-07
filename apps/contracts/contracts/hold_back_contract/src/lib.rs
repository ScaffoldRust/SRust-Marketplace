#![no_std]


use soroban_sdk::{Address, Env, contract, contractimpl, contracttype, contracterror, log, token};


#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum Error {
    NotInitialized = 1,
    InvalidAmount = 2,
    InvalidHoldbackRate = 3,
    InvalidBuyer = 4,
    InvalidSeller = 5,
    TransactionNotFound = 6,
    InvalidStatus = 7,
    Unauthorized = 8,
    AlreadyInitialized = 9,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
enum TransactionStatus {
    Held,
    HoldbackPending,
    Completed,
    Cancelled,
    Disputed,
}


#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Transaction {
    pub buyer: Address,
    pub seller: Address,
    pub amount: u128,
    pub token: Address,
    pub holdback_rate: u32,
    pub holdback_amount: u128,
    pub final_amount: u128,
    pub release_time: u64,
    pub status: TransactionStatus,
}

#[contracttype]
#[derive(Debug, Eq, PartialEq)]
pub enum DataKey {
    Transaction(u128),
    TransactionCounter,
    Token, 
    Admin,
}

const DAY_IN_SECONDS: u64 = 86400; 

#[contract]
pub struct HoldBackContract;

#[contractimpl]
impl HoldBackContract {
    pub fn initialize(env: Env, admin: Address) -> Result<bool, Error> {
        if env.storage().persistent().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().persistent().set(&DataKey::Admin, &admin);
        Ok(true)
    }

    pub fn create_payment(
        env: Env,
        buyer: Address,
        seller: Address,
        amount: u128,
        token: Address,
        holdback_rate: u32,
        holdback_days: u32,
    ) -> Result<u128, Error> {
        buyer.require_auth();
        let admin: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;

        if amount == 0 {
            return Err(Error::InvalidAmount);
        }
        if holdback_rate == 0 || holdback_rate > 100 {
            return Err(Error::InvalidHoldbackRate);
        }
        if buyer == seller || buyer == admin || seller == admin {
            return Err(Error::InvalidBuyer);
        }
        if buyer == token || seller == token {
            return Err(Error::InvalidSeller);
        }

        let holdback_amount = (amount * holdback_rate as u128) / 100;
        let final_amount = amount.checked_sub(holdback_amount).ok_or(Error::InvalidAmount)?;

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&buyer, &env.current_contract_address(), &(amount as i128));

        if final_amount > 0 {
            token_client.transfer(&env.current_contract_address(), &seller, &(final_amount as i128));
        }

        let transaction_id = env
            .storage()
            .persistent()
            .get(&DataKey::TransactionCounter)
            .unwrap_or(0u128)
            .checked_add(1)
            .ok_or(Error::InvalidAmount)?;
        env.storage()
            .persistent()
            .set(&DataKey::TransactionCounter, &transaction_id);

        let transaction = Transaction {
            buyer: buyer.clone(),
            seller: seller.clone(),
            amount,
            token,
            holdback_rate,
            holdback_amount,
            final_amount,
            release_time: env.ledger().timestamp() + (holdback_days as u64 * DAY_IN_SECONDS),
            status: TransactionStatus::Held,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Transaction(transaction_id), &transaction);

        env.events().publish(("transaction_created",),
            (transaction_id,
            buyer,
            seller,
            amount,
            holdback_amount,
        ));

        log!(
            &env,
            "Transaction {} created with holdback {}%",
            transaction_id,
            holdback_rate
        );
        Ok(transaction_id)
    }

    pub fn approve_release(env: Env, transaction_id: u128, buyer: Address) -> Result<(), Error> {
        buyer.require_auth();
        let mut transaction: Transaction = env
            .storage()
            .persistent()
            .get(&DataKey::Transaction(transaction_id))
            .ok_or(Error::TransactionNotFound)?;
        if transaction.buyer != buyer {
            return Err(Error::Unauthorized);
        }
        if transaction.status != TransactionStatus::Held {
            return Err(Error::InvalidStatus);
        }

        transaction.status = TransactionStatus::HoldbackPending;
        env.storage()
            .persistent()
            .set(&DataKey::Transaction(transaction_id), &transaction);

        Self::release_holdback_if_due(&env, transaction_id)?;
        Ok(())
    }

    pub fn initiate_dispute(env: Env, transaction_id: u128, buyer: Address) -> Result<(), Error> {
        buyer.require_auth();
        let mut transaction: Transaction = env
            .storage()
            .persistent()
            .get(&DataKey::Transaction(transaction_id))
            .ok_or(Error::TransactionNotFound)?;
        if transaction.buyer != buyer {
            return Err(Error::Unauthorized);
        }
        if transaction.status != TransactionStatus::Held
            && transaction.status != TransactionStatus::HoldbackPending
        {
            return Err(Error::InvalidStatus);
        }

        transaction.status = TransactionStatus::Disputed;
        env.storage()
            .persistent()
            .set(&DataKey::Transaction(transaction_id), &transaction);

        env.events().publish(( "dispute_initiated",),
            (transaction_id,
            buyer,
        ));
        Ok(())
    }

    pub fn resolve_dispute(
        env: Env,
        transaction_id: u128,
        refund: bool,
        admin: Address,
    ) -> Result<(), Error> {
        admin.require_auth();
        let stored_admin: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        if admin != stored_admin {
            return Err(Error::Unauthorized);
        }

        let mut transaction: Transaction = env
            .storage()
            .persistent()
            .get(&DataKey::Transaction(transaction_id))
            .ok_or(Error::TransactionNotFound)?;
        if transaction.status != TransactionStatus::Disputed {
            return Err(Error::InvalidStatus);
        }

        let token_client = token::Client::new(&env, &transaction.token);
        if refund {
            token_client.transfer(
                &env.current_contract_address(),
                &transaction.buyer,
                &(transaction.holdback_amount as i128),
            );
            transaction.status = TransactionStatus::Cancelled;
            env.events().publish(( "holdback_refunded",),
                (transaction_id,
                transaction.buyer.clone(),
                transaction.holdback_amount,
            ));
        } else {
            token_client.transfer(
                &env.current_contract_address(),
                &transaction.seller,
                &(transaction.holdback_amount as i128),
            );
            transaction.status = TransactionStatus::Completed;
            env.events().publish(("holdback_released",),
                (transaction_id,
                transaction.seller.clone(),
                transaction.holdback_amount,
            ));
        }
        env.storage().persistent().set(&DataKey::Transaction(transaction_id), &transaction);
        Ok(())
    }

    pub fn check_and_release(env: Env, transaction_id: u128) -> Result<(), Error> {
        let transaction: Transaction = env
            .storage()
            .persistent()
            .get(&DataKey::Transaction(transaction_id))
            .ok_or(Error::TransactionNotFound)?;
        if transaction.status != TransactionStatus::Held
            && transaction.status != TransactionStatus::HoldbackPending
        {
            return Err(Error::InvalidStatus);
        }

        Self::release_holdback_if_due(&env, transaction_id)?;
        Ok(())
    }

    fn release_holdback_if_due(env: &Env, transaction_id: u128) -> Result<(), Error> {
        let mut transaction: Transaction = env
            .storage()
            .persistent()
            .get(&DataKey::Transaction(transaction_id))
            .ok_or(Error::TransactionNotFound)?;

        if transaction.status == TransactionStatus::HoldbackPending
            || (transaction.status == TransactionStatus::Held
                && env.ledger().timestamp() >= transaction.release_time)
        {
            let token_client = token::Client::new(&env, &transaction.token);
            token_client.transfer(
                &env.current_contract_address(),
                &transaction.seller,
                &(transaction.holdback_amount as i128),
            );
            transaction.status = TransactionStatus::Completed;
            env.storage()
                .persistent()
                .set(&DataKey::Transaction(transaction_id), &transaction);

            env.events().publish(("holdback_released",),
                (transaction_id,
                transaction.seller,
                transaction.holdback_amount,
            ));
        }
        Ok(())
    }

    pub fn get_transaction(env: Env, transaction_id: u128) -> Result<Transaction, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Transaction(transaction_id))
            .ok_or(Error::TransactionNotFound)
    }

    pub fn get_admin(env: Env) -> Result<Address, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)
    }
}


#[cfg(test)]
mod test {
    use super::*;

    use soroban_sdk::{
        log,
        testutils::{Address as _, Ledger},
        token::{self, StellarAssetClient},
        Address, Env, String,
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

    fn create_variables_and_initialize_contract() -> (Env, HoldBackContractClient<'static>, Address) {
        let (env, contract_address, mocked_address) = create_variables();

        let contract_instance = HoldBackContractClient::new(&env, &contract_address);

        contract_instance.initialize(&mocked_address);

        (env, contract_instance, mocked_address)
    }

    fn generate_addresses(env: &Env) -> (Address, Address, Address, Address) {
        (Address::generate(env), Address::generate(env), Address::generate(env), Address::generate(env))
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

        let transaction_id = contract_instance
        .create_payment(&buyer, &seller, &1000, &token_address, &20, &7);
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

    let transaction_id = contract
        .create_payment(&buyer, &seller, &1000, &token_address, &20, &7);

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
    let transaction_id = contract
        .create_payment(&buyer, &seller, &1000, &token_address, &20, &1);

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

    let transaction_id = contract
        .create_payment(&buyer, &seller, &1000, &token_address, &20, &7);

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
    let transaction_id = contract
        .create_payment(&buyer, &seller, &1000, &token_address, &20, &7);

    contract.approve_release(&transaction_id, &seller);
}

#[test]
#[should_panic]
fn test_invalid_amount() {
    let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

    let (token_address, _) = create_token(&env, &admin);
    contract
        .create_payment(&buyer, &seller, &1000, &token_address, &20, &7);
}
#[test]
#[should_panic]
fn test_invalid_holdback_rate() {
    let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

    let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
    let transaction_id = contract
        .create_payment(&buyer, &seller, &1000, &token_address, &0, &7);
}

#[test]
#[should_panic]
fn test_unauthorized_dispute() {
    let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

    let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
    let transaction_id = contract
        .create_payment(&buyer, &seller, &1000, &token_address, &20, &7);

    contract.initiate_dispute(&transaction_id, &seller);
}

#[test]
#[should_panic]
fn test_unauthorized_resolve_dispute() {
    let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

    let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
    let transaction_id = contract
        .create_payment(&buyer, &seller, &1000, &token_address, &20, &7);

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
    let transaction_id = contract
        .create_payment(&buyer, &seller, &1000, &token_address, &20, &7);

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
    let transaction_id = contract
        .create_payment(&buyer, &buyer, &1000, &token_address, &20, &7);
}

#[test]
#[should_panic]
fn test_buyer_is_admin() {
    let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

    let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
    let transaction_id = contract
        .create_payment(&admin, &seller, &1000, &token_address, &20, &7);
}

#[test]
#[should_panic]
fn test_seller_is_token() {
    let (env, contract, admin) = create_variables_and_initialize_contract();

        let (buyer, seller, _, _) = generate_addresses(&env);

    let (token_address, token_client) = create_token(&env, &admin);
        token_client.mint(&buyer, &4000);
    let transaction_id = contract
        .create_payment(&buyer, &token_address, &1000, &token_address, &20, &7);
}
}

// #[test]
// #[should_panic(expected = "Status: InvalidHoldbackRate")]
// fn test_invalid_holdback_rate() {
//     let env = Env::default();
//     env.mock_all_auths();
//     let contract_id = env.register_contract(None, HoldBackContract);
//     let contract = HoldBackContract::new(&env, &contract_id);
//     let admin = Address::random(&env);
//     let buyer = Address::random(&env);
//     let seller = Address::random(&env);
//     let token = env.register_stellar_asset_contract(Address::random(&env));

//     contract.initialize(admin).unwrap();
//     contract
//         .create_payment(buyer, seller, 1000, token, 101, 7)
//         .unwrap();
// }

// #[test]
// #[should_panic(expected = "Status: Unauthorized")]
// fn test_unauthorized_dispute() {
//     let env = Env::default();
//     env.mock_all_auths();
//     let contract_id = env.register_contract(None, HoldBackContract);
//     let contract = HoldBackContract::new(&env, &contract_id);
//     let admin = Address::random(&env);
//     let buyer = Address::random(&env);
//     let seller = Address::random(&env);
//     let token = env.register_stellar_asset_contract(Address::random(&env));

//     contract.initialize(admin).unwrap();
//     let transaction_id = contract
//         .create_payment(buyer, seller.clone(), 1000, token, 20, 7)
//         .unwrap();

//     contract.initiate_dispute(transaction_id, seller).unwrap();
// }

// #[test]
// #[should_panic(expected = "Status: Unauthorized")]
// fn test_unauthorized_resolve_dispute() {
//     let env = Env::default();
//     env.mock_all_auths();
//     let contract_id = env.register_contract(None, HoldBackContract);
//     let contract = HoldBackContract::new(&env, &contract_id);
//     let admin = Address::random(&env);
//     let buyer = Address::random(&env);
//     let seller = Address::random(&env);
//     let token = env.register_stellar_asset_contract(Address::random(&env));

//     contract.initialize(admin).unwrap();
//     let transaction_id = contract
//         .create_payment(buyer.clone(), seller, 1000, token, 20, 7)
//         .unwrap();

//     contract.initiate_dispute(transaction_id, buyer).unwrap();
//     contract.resolve_dispute(transaction_id, true, buyer).unwrap();
// }

// #[test]
// #[should_panic(expected = "Status: InvalidStatus")]
// fn test_approve_invalid_status() {
//     let env = Env::default();
//     env.mock_all_auths();
//     let contract_id = env.register_contract(None, HoldBackContract);
//     let contract = HoldBackContract::new(&env, &contract_id);
//     let admin = Address::random(&env);
//     let buyer = Address::random(&env);
//     let seller = Address::random(&env);
//     let token = env.register_stellar_asset_contract(Address::random(&env));

//     contract.initialize(admin).unwrap();
//     let transaction_id = contract
//         .create_payment(buyer.clone(), seller, 1000, token, 20, 7)
//         .unwrap();

//     contract.initiate_dispute(transaction_id, buyer.clone()).unwrap();
//     contract.approve_release(transaction_id, buyer).unwrap();
// }

// #[test]
// #[should_panic(expected = "Status: InvalidBuyer")]
// fn test_buyer_is_seller() {
//     let env = Env::default();
//     env.mock_all_auths();
//     let contract_id = env.register_contract(None, HoldBackContract);
//     let contract = HoldBackContract::new(&env, &contract_id);
//     let admin = Address::random(&env);
//     let buyer = Address::random(&env);
//     let token = env.register_stellar_asset_contract(Address::random(&env));

//     contract.initialize(admin).unwrap();
//     contract
//         .create_payment(buyer.clone(), buyer, 1000, token, 20, 7)
//         .unwrap();
// }

// #[test]
// #[should_panic(expected = "Status: InvalidBuyer")]
// fn test_buyer_is_admin() {
//     let env = Env::default();
//     env.mock_all_auths();
//     let contract_id = env.register_contract(None, HoldBackContract);
//     let contract = HoldBackContract::new(&env, &contract_id);
//     let admin = Address::random(&env);
//     let seller = Address::random(&env);
//     let token = env.register_stellar_asset_contract(Address::random(&env));

//     contract.initialize(admin.clone()).unwrap();
//     contract
//         .create_payment(admin, seller, 1000, token, 20, 7)
//         .unwrap();
// }

// #[test]
// #[should_panic(expected = "Status: InvalidSeller")]
// fn test_seller_is_token() {
//     let env = Env::default();
//     env.mock_all_auths();
//     let contract_id = env.register_contract(None, HoldBackContract);
//     let contract = HoldBackContract::new(&env, &contract_id);
//     let admin = Address::random(&env);
//     let buyer = Address::random(&env);
//     let token = env.register_stellar_asset_contract(Address::random(&env));

//     contract.initialize(admin).unwrap();
//     contract
//         .create_payment(buyer, token, 1000, token, 20, 7)
//         .unwrap();
// }