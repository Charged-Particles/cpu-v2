import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';


describe('ChargedParticles', async function () {
  let deployer: string, ChargedParticles: Contract, NFTMock: Contract;

  before(async function () {
    const { deployer: deployerAccount } = await getNamedAccounts();
    deployer = deployerAccount;
  });

  beforeEach(async function () {
    await deployments.fixture([ 'ChargedParticles', 'NFTMock' ]);

    ChargedParticles = await ethers.getContract('ChargedParticles');
    NFTMock = await ethers.getContract('NFTMock');
  });

  it.only('should work properly', async function () {
    // Mint an NFT
    await NFTMock.mint(deployer, 1).then(tx => tx.wait());
    await NFTMock.mint(deployer, 2).then(tx => tx.wait());
    expect(await NFTMock.balanceOf(deployer)).to.be.equal(2);

    await NFTMock.approve(await ChargedParticles.getAddress(), 2);

    const NFTMockAddress = await NFTMock.getAddress();
    await ChargedParticles.covalentBond(
      NFTMockAddress,
      1,
      '6551',
      NFTMockAddress,
      2,
      1
    );

  });
});