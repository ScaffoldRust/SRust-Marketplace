#![no_std]


use soroban_sdk::{Address, Env, String, contract, contractimpl};


#[contract]
pub struct HoldBackContract;

#[contractimpl]
impl HoldBackContract {}