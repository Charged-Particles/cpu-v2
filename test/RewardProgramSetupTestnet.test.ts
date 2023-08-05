import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { getChargedParticlesOwner } from "../utils/getSigners";

describe('RewardProgramSetupTestnet deployments', async () => {
  let deployer, user, chargedOwner;

  beforeEach(async () => {
    await deployments.fixture(['RPSetupTest']);
  });

  before(async () => {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    chargedOwner = getChargedParticlesOwner();
    deployer = deployerAccount;
    user = user1;
  });

  it ('Energizes ', async () => {
      
  });

  it ('Bonds', async () => {
  });
});