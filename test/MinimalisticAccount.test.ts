import { expect } from "chai";
import { ethers, getNamedAccounts, deployments } from 'hardhat';
import { NFTMock, MinimalisticAccount } from "../typechain-types";


describe('MinimalisticAccount', async function () {
  let minimalisticAccount: MinimalisticAccount, nftMock: NFTMock;
  let deployer: string, receiver: string;

  before(async function () {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    deployer = deployerAccount;
    receiver = user1;
  });

  beforeEach(async function () {
    await deployments.fixture([ 'MinimalisticAccount', 'NFTMock' ]);

    minimalisticAccount = await ethers.getContract('MinimalisticAccount');
    nftMock = await ethers.getContract('NFTMock');
  });

  it.only('Deploys MinimalisticAccount', async function () {
    const minimalisticAccountAddress = await minimalisticAccount.getAddress();
    expect(minimalisticAccountAddress).to.not.be.empty
  });
});