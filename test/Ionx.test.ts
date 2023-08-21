import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { Ionx } from "../typechain-types";

describe('Ionx deployment', async () => {
  let ionx: Ionx;
  let deployer: string;

  beforeEach(async () => {
    await deployments.fixture(['Ionx']);
    ionx = await ethers.getContract('Ionx');
  });

  before(async () => {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    deployer = deployerAccount;
    console.log(deployer);
  });

  it ('Deployer is rich $$', async () => {
    const deployerBalance = await ionx.balanceOf(deployer);
    expect(deployerBalance).to.greaterThan(1000n)
  });
});