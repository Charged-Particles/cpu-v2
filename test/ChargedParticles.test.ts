import * as hre from 'hardhat';
import { Wallet, Contract } from 'zksync-ethers';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { expect } from 'chai';

import { getChainId, getWallet, getProvider, deployContract, LOCAL_RICH_WALLETS } from '../utils/utils';
import { performTx } from '../utils/performTx';
import { calculateAccountAddress } from '../utils/calculateAccountAddress';

import DeployRegistry from '../deploy/ERC6551zkSyncRegistry';
import DeploySmartAccount from '../deploy/SmartAccount';
import DeployERC20Mock from '../deploy/ERC20Mock';
import DeployNFTMock from '../deploy/NFTMock';
import DeploySmartAccountController from '../deploy/SAC_EX1';


describe('ChargedParticles', async function () {
  let chainId: bigint;
  const interfaceIds = {
    ISmartAccount: '0xf51fc6bd',
  };

  // Contracts
  let _chargedParticles: Contract;
  let _nftMock: Contract;
  let _erc20Mock: Contract;

  // Addresses
  let _chargedParticlesAddress: string;
  let _zkSyncRegistryAddress: string;
  let _nftMockAddress: string;
  let _erc20MockAddress: string;

  // Signers
  let _wallet: Wallet;
  let _deployer: Deployer;
  let _deployerAddress: string;
  let _receiver: string;

  const findEventArgs = (logs: any[], eventName: string) => {
    let _event = null;
    for (const event of logs) {
      if (event.fragment && event.fragment.name === eventName) {
        _event = event.args;
      }
    }
    return _event;
  };

  before(async function () {
    _wallet = getWallet();
    _deployer = new Deployer(hre, _wallet);
    _deployerAddress = _deployer.ethWallet.address;
    _receiver = LOCAL_RICH_WALLETS[1].address;
    chainId = await getChainId();

    // Deploy ERC20 Mock
    const { contract: erc20Mock, address: erc20MockAddress } = await DeployERC20Mock();
    _erc20Mock = erc20Mock;
    _erc20MockAddress = erc20MockAddress;

    // Deploy NFT Mock
    const { contract: nftMock, address: nftMockAddress } = await DeployNFTMock();
    _nftMock = nftMock;
    _nftMockAddress = nftMockAddress;

    // Deploy zkSyncRegistry
    const { contract: zkSyncRegistry, address: zkSyncRegistryAddress } = await DeployRegistry();
    _zkSyncRegistryAddress = zkSyncRegistryAddress;

    // Deploy SmartAccount
    const { bytecodeHash: smartAccountHash } = await DeploySmartAccount();

    // Deploy Charged Particles
    const constructorArgs = [
      zkSyncRegistryAddress,  // ERC6551zkSyncRegistry - Manual Deploy on zkEVM Chains
      smartAccountHash,       // BytecodeHash for Pre-deployed SmartAccount contract
    ]
    const { contract: chargedParticles, address: chargedParticlesAddress } = await deployContract('ChargedParticles', constructorArgs);
    _chargedParticles = chargedParticles;
    _chargedParticlesAddress = chargedParticlesAddress;

    // Deploy SmartAccountController_Example1
    const { contract: sac, address: sacAddress, bytecodeHash: sacHash } = await DeploySmartAccountController();

    // Set Default Execution Controller
    await performTx(await chargedParticles.setDefaultExecutionController(sacAddress), '');
  });

  it('Deploys ChargedParticles', async function () {
    const chargedParticlesAddress = await _chargedParticles.getAddress();
    expect(chargedParticlesAddress).to.not.be.empty;
  });


  it('Deploys a SmartAccount for an NFT', async function () {
    const tokenId = 1;

    await _nftMock.mint(_deployerAddress, tokenId).then(tx => tx.wait());
    expect(await _nftMock.balanceOf(_deployerAddress)).to.be.equal(1);

    await _erc20Mock.mint(_deployerAddress, 10000n).then(tx => tx.wait());
    expect(await _erc20Mock.balanceOf(_deployerAddress)).to.be.equal(10000n);

    // Calculate Expected Account Address via Registry
    const calcAccountAddress = await calculateAccountAddress(_chargedParticles, _zkSyncRegistryAddress, _nftMockAddress, tokenId, chainId);
    expect(calcAccountAddress).to.not.be.empty;

    // Energize NFT in order to Create new Smart Account
    await _erc20Mock.approve(_chargedParticlesAddress, 100n).then(tx => tx.wait());
    const newAccountReceipt = await _chargedParticles.energizeParticle(
      _nftMockAddress,
      tokenId,
      _erc20MockAddress,
      100n,
    ).then(tx => tx.wait());
    expect(newAccountReceipt).to.haveOwnProperty('hash');

    const args = findEventArgs(newAccountReceipt.logs, "NewAccountCreated");
    const realAccountAddress = args[0];
    expect(calcAccountAddress).to.be.equal(realAccountAddress);

    // Confirm new SmartAccount was actually created
    const provider = getProvider();
    const smartAccountCode = await provider.getCode(realAccountAddress);
    expect(smartAccountCode.replace('0x', '')).to.not.be.empty;

    // Confirm SmartAccount Supports correct Interface
    // TODO: Update SmartAccount isSmartAccount
    const smartAccountContract = await hre.zksyncEthers.getContractAt('SmartAccount', realAccountAddress);
    const isSmartAccount = await smartAccountContract.supportsInterface(interfaceIds.ISmartAccount);
    expect(isSmartAccount).to.be.true;

    // Confirm SmartAccount knows its Parent Token
    const smartAccountToken = await smartAccountContract.token();
    expect(smartAccountToken).to.be.lengthOf(3);
    expect(smartAccountToken[0]).to.be.equal(chainId);
    expect(smartAccountToken[1]).to.be.equal(_nftMockAddress);
    expect(smartAccountToken[2]).to.be.equal(tokenId);
  });


  it('Energizes and Releases an NFT', async function () {
    const tokenId = 2;

    await _nftMock.mint(_deployerAddress, tokenId).then(tx => tx.wait());
    await _erc20Mock.mint(_deployerAddress, 10000n).then(tx => tx.wait());
    const startingBalance = await _erc20Mock.balanceOf(_deployerAddress);

    // Calculate Expected Account Address via Registry
    const newAccountAddress = await calculateAccountAddress(_chargedParticles, _zkSyncRegistryAddress, _nftMockAddress, tokenId, chainId);
    expect(newAccountAddress).to.not.be.empty;

    // Energize NFT
    await _erc20Mock.approve(_chargedParticlesAddress, 10000n).then(tx => tx.wait());
    const newAccountReceipt = await _chargedParticles.energizeParticle(
      _nftMockAddress,
      tokenId,
      _erc20MockAddress,
      1500n,
    ).then(tx => tx.wait());
    expect(newAccountReceipt).to.haveOwnProperty('hash');
    expect(await _erc20Mock.balanceOf(newAccountAddress)).to.be.equal(1500n);
    expect(await _erc20Mock.balanceOf(_deployerAddress)).to.be.equal(startingBalance - 1500n);

    // Release NFT by Amount
    await _chargedParticles.releaseParticleAmount(
      _deployerAddress,
      _nftMockAddress,
      tokenId,
      _erc20MockAddress,
      500n,
    ).then(tx => tx.wait());
    expect(await _erc20Mock.balanceOf(newAccountAddress)).to.be.equal(1000n);
    expect(await _erc20Mock.balanceOf(_deployerAddress)).to.be.equal(startingBalance - 1000n);

    // Release Remainder from NFT
    await _chargedParticles.releaseParticle(
      _deployerAddress,
      _nftMockAddress,
      tokenId,
      _erc20MockAddress,
    ).then(tx => tx.wait());
    expect(await _erc20Mock.balanceOf(newAccountAddress)).to.be.equal(0);
    expect(await _erc20Mock.balanceOf(_deployerAddress)).to.be.equal(startingBalance);
  });


  it('Bonds and Breaks an NFT', async() => {
    const tokenId = 3;
    const depositedTokenId = 4;

    await _nftMock.mint(_deployerAddress, tokenId).then(tx => tx.wait());
    await _nftMock.mint(_deployerAddress, depositedTokenId).then(tx => tx.wait());

    // Calculate Expected Account Address via Registry
    const newAccountAddress = await calculateAccountAddress(_chargedParticles, _zkSyncRegistryAddress, _nftMockAddress, tokenId, chainId);
    expect(newAccountAddress).to.not.be.empty;

    // Give permission to Bond
    await _nftMock.approve(_chargedParticlesAddress, depositedTokenId).then(tx => tx.wait());
    expect(await _nftMock.getApproved(depositedTokenId)).to.be.eq(_chargedParticlesAddress);

    // Bond
    const bondReceipt = await _chargedParticles.covalentBond(
      _nftMockAddress,
      tokenId,
      _nftMockAddress,
      depositedTokenId,
      1n, // amount
    ).then(tx => tx.wait());
    expect(bondReceipt).to.haveOwnProperty('hash');

    // Confirm Nested NFT Owner
    expect(await _nftMock.ownerOf(depositedTokenId)).to.be.eq(newAccountAddress);

    // Break-Bond
    const breakReceipt = await _chargedParticles.breakCovalentBond(
      _receiver,
      _nftMockAddress,
      tokenId,
      _nftMockAddress,
      depositedTokenId,
      1n, // amount
    ).then(tx => tx.wait());
    expect(breakReceipt).to.haveOwnProperty('hash');

    // Confirm New Owner
    expect(await _nftMock.ownerOf(depositedTokenId)).to.be.eq(_receiver);
  });
});
