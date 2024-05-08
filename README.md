# cpu-v3
Charged Particles Multiverse + Bufficorn NFTs on zkSync!

## Deploy

First: Rename the `.env.sample` file to `.env` and update the Environment Variables within to contain Your Deployment-Wallet Private-Key, as well as your Alchemy and Etherscan API keys.

Commands to run (in order):

- `nvm use` - switch to correct version of NodeJS

- `yarn` - install dependencies

- `yarn deploy-bufficorn zkSyncTestnet` - deploy to zkSync Testnet
OR
- `yarn deploy-bufficorn zkSyncMainnet` - deploy to zkSync Mainnet

## On-chain Bufficorn Test

- `yarn test-bufficorn zkSyncTestnet` - test nesting of Trait NFTs into a Bufficorn (Testnet)
OR
- `yarn test-bufficorn zkSyncMainnet` - test nesting of Trait NFTs into a Bufficorn (Mainnet)


## Hardhat Unit-Tests

`yarn test`
