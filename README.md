# cpu-v3
Charged Particles Multiverse + Bufficorn NFTs on zkSync!

## Deploy

First: Rename the `.env.sample` file to `.env` and update the Environment Variables within to contain Your Deployment-Wallet Private-Key, as well as your Alchemy and Etherscan API keys.

Commands to run (in order):

`nvm use` - switch to correct version of NodeJS

`yarn` - install dependencies

`yarn deploy-bufficorn zkSyncTestnet` - deploy to zkSync Testnet
OR
`yarn deploy-bufficorn zkSyncMainnet` - deploy to zkSync Mainnet


## Test

`yarn test`
