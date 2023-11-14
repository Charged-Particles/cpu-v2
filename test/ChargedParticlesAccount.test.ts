import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { NFTMock, ChargedParticlesAccount, IERC6551Registry, ERC20Mock } from "../typechain-types";


describe('Account', async function () {
  const REGISTRY = 	"0x000000006551c19487814612e58FE06813775758";
  
  // Contracts
  let chargedParticlesAccount: ChargedParticlesAccount, nftMock: NFTMock, registryContract: IERC6551Registry;
  let erc20Mock: ERC20Mock;

  // Addresses
  let nftMockAddress: string, chargedParticlesAccountAddress: string, erc20MockAddress: string;
  // Signers
  let deployer: string, receiver: string;

  const salt = ethers.encodeBytes32String('0')

  before(async function () {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    deployer = deployerAccount;
    receiver = user1;
  });

  beforeEach(async function () {
    await deployments.fixture([ 'ChargedParticlesAccount', 'NFTMock', 'ERC20Mock' ]);

    chargedParticlesAccount = await ethers.getContract('ChargedParticlesAccount');
    nftMock = await ethers.getContract('NFTMock');
    erc20Mock = await ethers.getContract('ERC20Mock');

    registryContract = await ethers.getContractAt(
      'IERC6551Registry',
      REGISTRY
    );

    nftMockAddress = await nftMock.getAddress();
    erc20MockAddress = await erc20Mock.getAddress();
    chargedParticlesAccountAddress = await chargedParticlesAccount.getAddress();
  });

  it('Deploys ChargedParticlesAccount', async function () {
    const chargedParticlesAccountAddress = await chargedParticlesAccount.getAddress();
    expect(chargedParticlesAccountAddress).to.not.be.empty
  });

  it('Deploys account for NFT', async function () {
    const tokenId = 1;

    await nftMock.mint(deployer, tokenId).then(tx => tx.wait());
    expect(await nftMock.balanceOf(deployer)).to.be.equal(1);

    const newAccountAddress = await registryContract.account(
      chargedParticlesAccountAddress,
      salt,
      network.config.chainId ?? 137,
      nftMockAddress,
      tokenId,
    );
    expect(newAccountAddress).to.not.be.empty;

    const newAccountReceipt = await registryContract.createAccount(
      chargedParticlesAccountAddress,
      salt,
      network.config.chainId ?? 137,
      nftMockAddress,
      tokenId,
    ).then(tx => tx.wait());

    expect(newAccountReceipt).to.haveOwnProperty('hash');

    const chargedParticlesAccountContract = chargedParticlesAccount.attach(newAccountAddress) as ChargedParticlesAccount;
    const chargedParticlesDataFromTBA = await chargedParticlesAccountContract.token();

    expect(chargedParticlesDataFromTBA).to.be.lengthOf(3);
    expect(chargedParticlesDataFromTBA[1]).to.be.equal(nftMockAddress);
  });

  it('Bonds and breaks a NFT', async() => {
    const tokenId = 1;
    const depositedTokenId = 2;
    await nftMock.mint(deployer, depositedTokenId).then(tx => tx.wait());

    const newAccountAddress = await deployRegistryAccount(tokenId);
    
    // Give permission
    await nftMock.approve(newAccountAddress, depositedTokenId).then(tx => tx.wait());
    expect(await nftMock.getApproved(depositedTokenId)).to.be.eq(newAccountAddress);
    
    // Bond
    const account = await ethers.getContractAt('ChargedParticlesAccount', newAccountAddress);

    await account.covalentBond(
      nftMockAddress,
      depositedTokenId,
      1 // amount
    ).then(tx => tx.wait());

    // Check owner
    expect(await nftMock.ownerOf(depositedTokenId)).to.be.eq(newAccountAddress);

    await account.breakCovalentBond(
      receiver,
      nftMockAddress,
      depositedTokenId,
      1
    ).then(tx => tx.wait());

    expect(await nftMock.ownerOf(depositedTokenId)).to.be.eq(receiver);
  });

  it('Energize and discharge', async() => {
    const tokenId = 1;
    const newAccountAddress = await deployRegistryAccount(tokenId);

    const mintAmount = ethers.parseEther('100');
    await erc20Mock.mint(deployer, mintAmount).then(tx => tx.wait());

    expect(await erc20Mock.balanceOf(deployer)).to.be.eq(mintAmount);

    // energize
    // 1. approve account to manipulate tokens from deployer account
    await erc20Mock.approve(newAccountAddress, mintAmount).then(tx => tx.wait());

    // 2. transfer to account
    const account = await ethers.getContractAt('ChargedParticlesAccount', newAccountAddress);
    await account.energizeParticle(erc20MockAddress, mintAmount).then(tx => tx.wait());

    expect(await erc20Mock.balanceOf(newAccountAddress)).to.be.eq(mintAmount);
    expect(await erc20Mock.balanceOf(deployer)).to.be.eq(0);

    await account.dischargeParticle(receiver, erc20MockAddress, mintAmount).then(tx => tx.wait());

    expect(await erc20Mock.balanceOf(newAccountAddress)).to.be.eq(0);
    expect(await erc20Mock.balanceOf(receiver)).to.be.eq(mintAmount);
  });

  it('Returns the first four bytes', async() => {
    const calldata = "0xa9059cbb00000000000000000000000003828b7129d49313b2cdc966e50369b75ec79a4800000000000000000000000000000000000000000000000000000008a22b974b";
    const calldataFourBytes = await chargedParticlesAccount.parseFirst4Bytes(calldata)
    expect(calldataFourBytes).to.be.eq('0xa9059cbb');
  });

  const deployRegistryAccount = async(tokenId: number) => {
    await nftMock.mint(deployer, tokenId).then(tx => tx.wait());

    // Create an account
    const newAccountAddress = await registryContract.account(
      chargedParticlesAccountAddress,
      salt,
      network.config.chainId ?? 137,
      nftMockAddress,
      tokenId,
    );

    await registryContract.createAccount(
      chargedParticlesAccountAddress,
      salt,
      network.config.chainId ?? 137,
      nftMockAddress,
      tokenId,
    ).then(tx => tx.wait());

    return newAccountAddress;
  }
});
