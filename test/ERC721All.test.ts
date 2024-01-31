import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { ERC721All } from "../typechain-types";


describe('ERC721All', async function () {
  // Contracts
  let NFT: ERC721All;
  // Addresses
  let NFTAddress: string;
  // Signers
  let deployer: string, receiver: string;

  before(async function () {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    deployer = deployerAccount;
    receiver = user1;
  });

  beforeEach(async function () {
    await deployments.fixture([ 'ERC721All' ]);

    NFT = await ethers.getContract('ERC721All');

    NFTAddress = await NFT.getAddress();
  });

  it('Deploys NFTAll', async function () {
    expect(NFTAddress).to.not.be.empty
  });

  it('Mints', async () => {
    const mintReceipt = await NFT.mint().then(tx => tx.wait());
    const ownerOfDeployer = await NFT.ownerOf(deployer);
    expect(ownerOfDeployer).to.be.eq(deployer)

    await NFT.connect(await ethers.getSigner(receiver)).mint().then(tx => tx.wait());
    const ownerOfReceiver = await NFT.ownerOf(receiver);
    expect(ownerOfReceiver).to.be.eq(receiver);
  });
});
