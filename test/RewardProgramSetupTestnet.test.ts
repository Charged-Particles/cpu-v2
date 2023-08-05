import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';

describe('RewardProgramSetupTestnet deployments', async () => {
  let deployer, user;

  beforeEach(async () => {
    await deployments.fixture(['RPSetupTest']);
  });

  before(async () => {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    deployer = deployerAccount;
    user = user1;
  });

  it ('', async () => {
  });
});