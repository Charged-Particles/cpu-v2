import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { NFTMock, Account, IRegistry } from "../typechain-types";


describe('Execute calls', async function () {
  const REGISTRY = 	"0x02101dfB77FDE026414827Fdc604ddAF224F0921";
  
  // Contracts
  let chargedParticlesAccount: Account, nftMock: NFTMock, registryContract: IRegistry;
  // Addresses
  let nftMockAddress: string, chargedParticlesAccountAddress: string;
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
    registryContract = await ethers.getContractAt(
      'IRegistry',
      REGISTRY
    );

    nftMockAddress = await nftMock.getAddress();
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

    const chargedParticlesAccountContract = chargedParticlesAccount.attach(newAccountAddress) as Account;
    const chargedParticlesDataFromTBA = await chargedParticlesAccountContract.token();

    expect(chargedParticlesDataFromTBA).to.be.lengthOf(3);
    expect(chargedParticlesDataFromTBA[1]).to.be.equal(nftMockAddress);
  });

  it('Bonds and breaks a NFT', async() => {
    const tokenId = 1;
    const depositedTokenId = 2;
    await nftMock.mint(deployer, tokenId).then(tx => tx.wait());
    await nftMock.mint(deployer, depositedTokenId).then(tx => tx.wait());

    // Create an account
    const newAccountAddress = await registryContract.account(
      chargedParticlesAccountAddress,
      network.config.chainId ?? 137,
      nftMockAddress,
      tokenId,
      0 
    );

    await registryContract.createAccount(
      chargedParticlesAccountAddress,
      network.config.chainId ?? 137,
      nftMockAddress,
      tokenId,
      0,
      '0x'
    ).then(tx => tx.wait());

    // Give permission
    await nftMock.approve(newAccountAddress, depositedTokenId).then(tx => tx.wait());
    expect(await nftMock.getApproved(depositedTokenId)).to.be.eq(newAccountAddress);
    
    await nftMock.transferFrom(deployer, newAccountAddress, depositedTokenId).then(tx => tx.wait());
    
    // Check owner
    expect(await nftMock.ownerOf(depositedTokenId)).to.be.eq(newAccountAddress);
        
    const account = await ethers.getContractAt('ChargedParticlesAccount', newAccountAddress);

    const breakCovalentBond = (from: string, to:string, tokenId:number) => {
      const ABI = ["function safeTransferFrom(address from, address to, uint256 tokenId)"];
      const iface = new ethers.Interface(ABI);
      const cdata = iface.encodeFunctionData("safeTransferFrom", [from, to, tokenId]); 

      return cdata;
    };

    const breakCovalentBondCallData = breakCovalentBond(newAccountAddress, receiver, depositedTokenId); 

    await account.executeCall(
      nftMockAddress,
      0,
      breakCovalentBondCallData
    ).then(tx => tx.wait());

    expect(await nftMock.ownerOf(depositedTokenId)).to.be.eq(receiver);
  });

  it('Filters out approve calls', async() => {
    const approveCall = (to:string, tokenId:number) => {
      const ABI = ["function approve(address,uint256)"];
      const iface = new ethers.Interface(ABI);
      const cdata = iface.encodeFunctionData("approve", [to, tokenId]); 

      return cdata;
    };

    const tokenId = 1;
    const depositedTokenId = 2;
    await nftMock.mint(deployer, tokenId).then(tx => tx.wait());
    await nftMock.mint(deployer, depositedTokenId).then(tx => tx.wait());

    // Create an account
    const newAccountAddress = await registryContract.account(
      chargedParticlesAccountAddress,
      network.config.chainId ?? 137,
      nftMockAddress,
      tokenId,
      0 
    );

    await registryContract.createAccount(
      chargedParticlesAccountAddress,
      network.config.chainId ?? 137,
      nftMockAddress,
      tokenId,
      0,
      '0x'
    ).then(tx => tx.wait());

    const account = await ethers.getContractAt('ChargedParticlesAccount', newAccountAddress);
      
    const approveCallData = approveCall('0x277BFc4a8dc79a9F194AD4a83468484046FAFD3A', depositedTokenId);
    
    await expect(account.executeCall(
      nftMockAddress,
      0,
      approveCallData

    )).revertedWith('Method all not allowed'); 
  });

});
