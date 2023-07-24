import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, getNamedAccounts, deployments } from 'hardhat';
import { NFTMock, ChargedParticles } from "../typechain-types";


describe('ChargedParticles', async function () {
  let deployer: string, chargedParticles: ChargedParticles, nftMock: NFTMock;

  before(async function () {
    const { deployer: deployerAccount } = await getNamedAccounts();
    deployer = deployerAccount;
  });

  beforeEach(async function () {
    await deployments.fixture([ 'ChargedParticles', 'NFTMock' ]);

    chargedParticles = await ethers.getContract('ChargedParticles');
    nftMock = await ethers.getContract('NFTMock');
  });

  it.only('Should bond a NFT into a TBA', async function () {
    // Mint an NFT
    await nftMock.mint(deployer, 1).then(tx => tx.wait());
    await nftMock.mint(deployer, 2).then(tx => tx.wait());
    expect(await nftMock.balanceOf(deployer)).to.be.equal(2);

    const nftMockAddress = await nftMock.getAddress();
    const BasketNFT = 1;
    const NestedNFT = 2;

    await nftMock.approve(await chargedParticles.getAddress(), NestedNFT);

    await chargedParticles.covalentBond(
      nftMockAddress,
      BasketNFT,
      '6551',
      nftMockAddress,
      NestedNFT,
      1
    );

    const newNestedNFTOwner = await nftMock.ownerOf(NestedNFT);
    const tokenBoundAccountForBasketNFT = await chargedParticles.account(nftMockAddress, BasketNFT);
    expect(newNestedNFTOwner).to.be.equal(tokenBoundAccountForBasketNFT);
  });
});