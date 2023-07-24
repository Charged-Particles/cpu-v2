import { expect } from "chai";
import { ethers, getNamedAccounts, deployments } from 'hardhat';
import { NFTMock, ChargedParticles } from "../typechain-types";


describe('ChargedParticles', async function () {
  let chargedParticles: ChargedParticles, nftMock: NFTMock;
  let deployer: string, receiver: string

  before(async function () {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    deployer = deployerAccount;
    receiver = user1;
  });

  beforeEach(async function () {
    await deployments.fixture([ 'ChargedParticles', 'NFTMock' ]);

    chargedParticles = await ethers.getContract('ChargedParticles');
    nftMock = await ethers.getContract('NFTMock');
  });

  it.only('ERC721: Should bond a NFT into a TBA and then break it.', async function () {
    // Mint an NFT
    await nftMock.mint(deployer, 1).then(tx => tx.wait());
    await nftMock.mint(deployer, 2).then(tx => tx.wait());
    expect(await nftMock.balanceOf(deployer)).to.be.equal(2);

    const nftMockAddress = await nftMock.getAddress();
    const chargedParticlesAddress = await chargedParticles.getAddress();
    const basketNFT = 1;
    const nestedNFT = 2;

    await nftMock.approve(chargedParticlesAddress, nestedNFT);

    await chargedParticles.covalentBond(
      nftMockAddress,
      basketNFT,
      '6551',
      nftMockAddress,
      nestedNFT,
      1
    );

    const newNestedNFTOwner = await nftMock.ownerOf(nestedNFT);
    const tokenBoundAccountForBasketNFT = await chargedParticles.account(nftMockAddress, basketNFT);
    expect(newNestedNFTOwner).to.be.equal(tokenBoundAccountForBasketNFT);

    // break bond to receiver
    await nftMock.approve(chargedParticlesAddress, nestedNFT);
    await chargedParticles.breakCovalentBond(
      receiver,
      nftMockAddress,
      basketNFT,
      '6551',
      nftMockAddress,
      nestedNFT,
      1,
    )
  });
});