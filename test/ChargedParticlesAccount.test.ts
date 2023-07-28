import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { NFTMock, MinimalisticAccount } from "../typechain-types";


describe('MinimalisticAccount', async function () {
  const REGISTRY = 	"0x02101dfB77FDE026414827Fdc604ddAF224F0921";
  
  // Contracts
  let chargedParticlesAccount: MinimalisticAccount, nftMock: NFTMock;
  // Addresses
  let nftMockAddress: string
  // Signers
  let deployer: string, receiver: string;

  before(async function () {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    deployer = deployerAccount;
    receiver = user1;
  });

  beforeEach(async function () {
    await deployments.fixture([ 'ChargedParticlesAccount', 'NFTMock' ]);

    chargedParticlesAccount = await ethers.getContract('ChargedParticlesAccount');
    nftMock = await ethers.getContract('NFTMock');

    nftMockAddress = await nftMock.getAddress();
  });

  it('Deploys MinimalisticAccount', async function () {
    const chargedParticlesAccountAddress = await chargedParticlesAccount.getAddress();
    expect(chargedParticlesAccountAddress).to.not.be.empty
  });

  it('Deploys account for NFT', async function () {
    const tokenId = 1;

    await nftMock.mint(deployer, tokenId).then(tx => tx.wait());
    expect(await nftMock.balanceOf(deployer)).to.be.equal(1);

    const chargedParticlesAccountAddress = await chargedParticlesAccount.getAddress();
    const registryContract = await ethers.getContractAt(
      'IRegistry',
      REGISTRY
    );

    const newAccountAddress = await registryContract.account(
      chargedParticlesAccountAddress,
      network.config.chainId ?? 137,
      nftMockAddress,
      tokenId,
      0 
    );
    expect(newAccountAddress).to.not.be.empty;

    const newAccountReceipt = await registryContract.createAccount(
      chargedParticlesAccountAddress,
      network.config.chainId ?? 137,
      nftMockAddress,
      tokenId,
      0,
      '0x'
    ).then(tx => tx.wait());

    expect(newAccountReceipt).to.haveOwnProperty('hash');

    const chargedParticlesAccountContract = chargedParticlesAccount.attach(newAccountAddress) as MinimalisticAccount;
    const chargedParticlesDataFromTBA = await chargedParticlesAccountContract.token();

    expect(chargedParticlesDataFromTBA).to.be.lengthOf(3);
    expect(chargedParticlesDataFromTBA[1]).to.be.equal(nftMockAddress);
  });
});
