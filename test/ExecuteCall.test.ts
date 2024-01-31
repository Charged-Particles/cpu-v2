import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { NFTMock, ChargedParticles, IERC6551Registry } from "../typechain-types";


describe('Execute calls', async function () {
  const REGISTRY = 	"0x000000006551c19487814612e58FE06813775758";

  // Contracts
  let chargedParticles: ChargedParticles, nftMock: NFTMock, registryContract: IERC6551Registry;
  // Addresses
  let nftMockAddress: string, chargedParticlesAddress: string;
  // Signers
  let deployer: string, receiver: string;

  const salt = ethers.encodeBytes32String('0')

  // before(async function () {
  //   const { deployer: deployerAccount, user1 } = await getNamedAccounts();
  //   deployer = deployerAccount;
  //   receiver = user1;
  // });

  // beforeEach(async function () {
  //   await deployments.fixture([ 'ChargedParticles', 'NFTMock' ]);

  //   chargedParticles = await ethers.getContract('ChargedParticles');
  //   nftMock = await ethers.getContract('NFTMock');
  //   registryContract = await ethers.getContractAt(
  //     'IERC6551Registry',
  //     REGISTRY
  //   );

  //   nftMockAddress = await nftMock.getAddress();
  //   chargedParticlesAddress = await chargedParticles.getAddress();
  // });

  // it('Deploys ChargedParticles', async function () {
  //   const chargedParticlesAddress = await chargedParticles.getAddress();
  //   expect(chargedParticlesAddress).to.not.be.empty
  // });

  // it('Deploys account for NFT', async function () {
  //   const tokenId = 1;

  //   await nftMock.mint(deployer, tokenId).then(tx => tx.wait());
  //   expect(await nftMock.balanceOf(deployer)).to.be.equal(1);

  //   const newAccountAddress = await registryContract.account(
  //     chargedParticlesAddress,
  //     salt,
  //     network.config.chainId ?? 137,
  //     nftMockAddress,
  //     tokenId,
  //   );
  //   expect(newAccountAddress).to.not.be.empty;

  //   const newAccountReceipt = await registryContract.createAccount(
  //     chargedParticlesAddress,
  //     salt,
  //     network.config.chainId ?? 137,
  //     nftMockAddress,
  //     tokenId,
  //   ).then(tx => tx.wait());

  //   expect(newAccountReceipt).to.haveOwnProperty('hash');

  //   const chargedParticlesContract = chargedParticles.attach(newAccountAddress) as Account;
  //   const chargedParticlesDataFromTBA = await chargedParticlesContract.token();

  //   expect(chargedParticlesDataFromTBA).to.be.lengthOf(3);
  //   expect(chargedParticlesDataFromTBA[1]).to.be.equal(nftMockAddress);
  // });

  // it('Bonds and breaks a NFT', async() => {
  //   const tokenId = 1;
  //   const depositedTokenId = 2;
  //   await nftMock.mint(deployer, tokenId).then(tx => tx.wait());
  //   await nftMock.mint(deployer, depositedTokenId).then(tx => tx.wait());

  //   // Create an account
  //   const newAccountAddress = await registryContract.account(
  //     chargedParticlesAddress,
  //     salt,
  //     network.config.chainId ?? 137,
  //     nftMockAddress,
  //     tokenId,
  //   );

  //   await registryContract.createAccount(
  //     chargedParticlesAddress,
  //     salt,
  //     network.config.chainId ?? 137,
  //     nftMockAddress,
  //     tokenId,
  //     ).then(tx => tx.wait());

  //   // Give permission
  //   await nftMock.approve(newAccountAddress, depositedTokenId).then(tx => tx.wait());
  //   expect(await nftMock.getApproved(depositedTokenId)).to.be.eq(newAccountAddress);

  //   await nftMock.transferFrom(deployer, newAccountAddress, depositedTokenId).then(tx => tx.wait());

  //   // Check owner
  //   expect(await nftMock.ownerOf(depositedTokenId)).to.be.eq(newAccountAddress);

  //   const account = await ethers.getContractAt('ChargedParticles', newAccountAddress);

  //   const breakCovalentBond = (from: string, to:string, tokenId:number) => {
  //     const ABI = ["function safeTransferFrom(address from, address to, uint256 tokenId)"];
  //     const iface = new ethers.Interface(ABI);
  //     const cdata = iface.encodeFunctionData("safeTransferFrom", [from, to, tokenId]);

  //     return cdata;
  //   };

  //   const breakCovalentBondCallData = breakCovalentBond(newAccountAddress, receiver, depositedTokenId);

  //   await account.execute(
  //     nftMockAddress,
  //     0,
  //     breakCovalentBondCallData,
  //     0,
  //   ).then(tx => tx.wait());

  //   expect(await nftMock.ownerOf(depositedTokenId)).to.be.eq(receiver);
  // });

  // it('Filters out approve calls', async() => {
  //   const approveCall = (to:string, tokenId:number) => {
  //     const ABI = ["function approve(address,uint256)"];
  //     const iface = new ethers.Interface(ABI);
  //     const cdata = iface.encodeFunctionData("approve", [to, tokenId]);

  //     return cdata;
  //   };

  //   const tokenId = 1;
  //   const depositedTokenId = 2;
  //   await nftMock.mint(deployer, tokenId).then(tx => tx.wait());
  //   await nftMock.mint(deployer, depositedTokenId).then(tx => tx.wait());

  //   // Create an account
  //   const newAccountAddress = await registryContract.account(
  //     chargedParticlesAddress,
  //     salt,
  //     network.config.chainId ?? 137,
  //     nftMockAddress,
  //     tokenId,
  //   );

  //   await registryContract.createAccount(
  //     chargedParticlesAddress,
  //     salt,
  //     network.config.chainId ?? 137,
  //     nftMockAddress,
  //     tokenId,
  //   ).then(tx => tx.wait());

  //   const account = await ethers.getContractAt('ChargedParticles', newAccountAddress);

  //   const approveCallData = approveCall('0x277BFc4a8dc79a9F194AD4a83468484046FAFD3A', depositedTokenId);

  //   await expect(account.execute(
  //     nftMockAddress,
  //     0,
  //     approveCallData,
  //     0
  //   )).revertedWith('Method all not allowed');
  // });

});
