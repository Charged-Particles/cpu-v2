require('dotenv').config()
import { HardhatUserConfig } from 'hardhat/config';
import '@typechain/hardhat';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-chai-matchers'

const mnemonic = {
  testnet: `${process.env.TESTNET_MNEMONIC}`.replace(/_/g, ' '),
  mainnet: `${process.env.MAINNET_MNEMONIC}`.replace(/_/g, ' '),
};
const optimizerDisabled = process.env.OPTIMIZER_DISABLED

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.4.7',
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: !optimizerDisabled,
            runs: 200
          }
        },
      },
      {
        version: '0.8.13',
        settings: {
          optimizer: {
            enabled: !optimizerDisabled,
            runs: 200
          }
        },
      },
      {
        version: '0.7.6',
      },
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: !optimizerDisabled,
            runs: 200
          }
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    protocolOwner: {
      default: 1,
    },
    user1: {
      default: 2,
    },
    user2: {
      default: 3,
    },
    user3: {
      default: 4,
    },
  },
  paths: {
      sources: './contracts',
      tests: './test',
      cache: './cache',
      artifacts: './build/contracts',
      deploy: './deploy',
      deployments: './deployments'
  },
  networks: {
    hardhat: {
      chainId: 80001,
      forking: {
        url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_MUMBAI_API_KEY}`,
        blockNumber: 38812688
        // url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_APIKEY}`,
        // blockNumber: 38812688
      },
      accounts: {
        mnemonic: mnemonic.testnet,
        initialIndex: 0,
        count: 10,
      },
    },
    goerli: {
        url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_APIKEY}`,
        gasPrice: 'auto',
        accounts: {
            mnemonic: mnemonic.testnet,
            initialIndex: 0,
            count: 10,
        }
    },
    sepolia: {
        url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_SEPOLIA_API_KEY}`,
        gasPrice: 'auto',
        accounts: {
            mnemonic: mnemonic.testnet,
            initialIndex: 0,
            count: 10,
        },
        chainId: 11155111
    },
    mainnet: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_APIKEY}`,
        gasPrice: 'auto',
        accounts: {
            mnemonic: mnemonic.mainnet,
            initialIndex: 0,
            count: 10,
        }
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_MUMBAI_API_KEY}`,
        gasPrice: 10e9,
        accounts: {
            mnemonic: mnemonic.testnet,
            initialIndex: 0,
            count: 10,
        },
        chainId: 80001
    },
    polygon: {
        url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_APIKEY}`,
        gasPrice: 'auto',
        accounts: {
            mnemonic: mnemonic.mainnet,
            count: 8,
        },
        chainId: 137
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_APIKEY ?? '',
      polygonMumbai: process.env.POLYGONSCAN_APIKEY ?? '',
    }
  },
  gasReporter: {
      currency: 'USD',
      gasPrice: 1,
      enabled: (process.env.REPORT_GAS) ? true : false
  },
};

export default config;
