import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { UniverseRP } from "../typechain-types";

describe('UniverseRP deployment', async () => {
  let universe: UniverseRP;
  let deployer: string;

  beforeEach(async () => {
    await deployments.fixture(['UniverseRP']);
    universe = await ethers.getContract('UniverseRP');
  });

  before(async () => {
    const { deployer: deployerAccount } = await getNamedAccounts();
    deployer = deployerAccount;
  });

  it ('is deployed', async () => {
    const owner = await universe.owner();
    expect(owner).to.equal(deployer);
  });
});