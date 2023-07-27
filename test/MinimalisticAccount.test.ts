import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { NFTMock, MinimalisticAccount } from "../typechain-types";


describe('MinimalisticAccount', async function () {
  const REGISTRY = 	"0x02101dfB77FDE026414827Fdc604ddAF224F0921";
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

  it('Deploys MinimalisticAccount', async function () {
    const minimalisticAccountAddress = await minimalisticAccount.getAddress();
    expect(minimalisticAccountAddress).to.not.be.empty
  });

  it('Deploys account for NFT', async function () {
    const tokenId = 1;

    await nftMock.mint(deployer, tokenId).then(tx => tx.wait());
    expect(await nftMock.balanceOf(deployer)).to.be.equal(1);

    const minimalisticAccountAddress = await minimalisticAccount.getAddress();
    const registryContract = await ethers.getContractAt(
      'IRegistry',
      REGISTRY
    );

    const newAccountAddress = await registryContract.account(
      minimalisticAccountAddress,
      network.config.chainId ?? 137,
      await nftMock.getAddress(),
      tokenId,
      0 
    );
    expect(newAccountAddress).to.not.be.empty;

    const newAccountReceipt = await registryContract.createAccount(
      minimalisticAccountAddress,
      network.config.chainId ?? 137,
      await nftMock.getAddress(),
      tokenId,
      0,
      '0x'
    ).then(tx => tx.wait());

    expect(newAccountReceipt).to.haveOwnProperty('hash');


  });

});
