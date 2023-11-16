import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { ERC721All } from "../typechain-types";


describe('Execute calls', async function () {
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

  it('Mints deployer', async () => {
    const mintReceipt = await NFT.mint().then(tx => tx.wait());
    const ownerOfDeployer = await NFT.ownerOf(deployer);
    expect(ownerOfDeployer).to.be.eq(deployer)
  });

  it('Mints receiver', async () => {
    await NFT.connect(await ethers.getSigner(receiver)).mint().then(tx => tx.wait());
    const ownerOfReceiver = await NFT.ownerOf(receiver);
    expect(ownerOfReceiver).to.be.eq(receiver);
  });

  it('Transfers', async () => {
    await NFT.mint().then(tx => tx.wait());
    const ownerOfDeployer = await NFT.ownerOf(deployer);
    expect(ownerOfDeployer).to.be.eq(deployer)

    await NFT.transferFrom(deployer, receiver, deployer).then(tx => tx.wait());
    expect(await NFT.ownerOf(deployer)).to.be.eq(receiver);
  });

  it('Checks base uri', async() => {
    await NFT.mint().then(tx => tx.wait());
    const uriFromContract = await NFT.tokenURI(deployer);
    expect(uriFromContract).to.be.eq('test/url/');
  });
});
