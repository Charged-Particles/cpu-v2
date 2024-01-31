import { expect } from "chai";
import { ethers, getNamedAccounts, deployments } from 'hardhat';
import { ERC721i } from "../typechain-types";


describe('ERC721i', async function () {
  // Contracts
  let NFT: ERC721i;
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
    await deployments.fixture([ 'ERC721i' ]);

    NFT = await ethers.getContract('ERC721i');

    NFTAddress = await NFT.getAddress();
  });

  it('Deploys NFTi', async function () {
    expect(NFTAddress).to.not.be.empty
  });

  it('Pre-mints NFTs', async() => {
    await expect(NFT.preMint()).to.emit(NFT, 'ConsecutiveTransfer');
    expect(await NFT.ownerOf(1)).to.be.eq(deployer);
    expect(await NFT.ownerOf(1000)).to.be.eq(deployer);
    expect(await NFT.ownerOf(99999)).to.be.eq(deployer);
  });

  it('Checks base uri', async() => {
    const uriFromContract = await NFT.tokenURI(1);
    expect(uriFromContract).to.be.eq('test/url/1');
  });
});
