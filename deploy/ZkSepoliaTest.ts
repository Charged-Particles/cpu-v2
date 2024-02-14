import { Wallet, Provider, Signer, Contract, utils } from "zksync-ethers";
import { ethers } from "ethers";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { getProvider, getWallet } from '../utils/utils';
import { performTx } from '../utils/performTx';
import DeployERC20Mock from './ERC20Mock';
import DeployNFTMock from './NFTMock';
import * as ZkSyncRegistryDeployData from '../artifacts-zk/contracts/ERC6551zkSyncRegistry.sol/ERC6551zkSyncRegistry.json';
import * as ChargedParticlesDeployData from '../artifacts-zk/contracts/ChargedParticles.sol/ChargedParticles.json';
import * as ERC20MockDeployData from '../artifacts-zk/contracts/mock/ERC20Mock.sol/ERC20Mock.json';
import * as NFTMockDeployData from '../artifacts-zk/contracts/mock/NFTMock.sol/NFTMock.json';

const salt = ethers.encodeBytes32String('');
const input = ethers.encodeBytes32String('');
const chainId = 1;
const interfaceIds = {
  ISmartAccount:            '0x2f62b227',
  ISmartAccountController:  '0x39b43188',
  IChargedParticles:        '0xfb86e1eb',
  IDynamicTraits:           '0x33c2cbef',
};

// Addresses
const _chargedParticlesAddress: string = '0x971B39bEbe7e2927DA05796bBcFefE103D3370B5';
const _registryAddress: string = '0xAaa579e2CD892d24565bDA027225745c11C6A5D9';
const _smartAccountHash = [1,0,3,205,22,198,53,47,105,91,226,66,219,132,216,79,158,249,5,214,143,60,178,51,191,3,19,72,136,43,187,136];
let _nftMockAddress: string = '';
let _erc20MockAddress: string = '';

// Contracts
let _chargedParticles: Contract;
let _zkSyncRegistry: Contract;
let _nftMock: Contract;
let _erc20Mock: Contract;

// Wallets/Signers/Providers
let _provider: Provider;
let _wallet: Wallet;
let _walletAddress: string;
let _deployer: Deployer;

const calculateAccountAddress = async (nftContractAddress: string, nftTokenId: number) => {
  const smartAccountHash = await _chargedParticles.getAccountBytecodeHash(nftContractAddress);
  const newAccountAddress = utils.create2Address(
    _walletAddress,
    smartAccountHash,
    salt,
    input,
  );
  return newAccountAddress;
};

export default async function () {
  _provider = getProvider();
  _wallet = getWallet();
  _deployer = new Deployer(hre, _wallet);
  _walletAddress = _wallet.address;

  // Load ERC6551 zkSync Registry
  _zkSyncRegistry = new Contract(_registryAddress, ZkSyncRegistryDeployData.abi, _wallet);

  // Load Charged Particles
  _chargedParticles = new Contract(_chargedParticlesAddress, ChargedParticlesDeployData.abi, _wallet);

  // // Deploy ERC20 Mock
  // console.log(`Deploying Mock ERC20 Token...`);
  // const { contract: erc20Mock, address: erc20MockAddress } = await DeployERC20Mock();
  // _erc20Mock = erc20Mock;
  // _erc20MockAddress = erc20MockAddress;
  _erc20MockAddress = '0xeCd4906d84670b87e1085233A0471cEa0E7AeCf7';
  _erc20Mock = new Contract(_erc20MockAddress, ERC20MockDeployData.abi, _wallet);


  // // Deploy NFT Mock
  // console.log(`Deploying Mock NFT Contract...`);
  // const { contract: nftMock, address: nftMockAddress } = await DeployNFTMock();
  // _nftMock = nftMock;
  // _nftMockAddress = nftMockAddress;
  _nftMockAddress = '0x79Ba636d5169876068eA45f88851598F85797fF6';
  _nftMock = new Contract(_nftMockAddress, NFTMockDeployData.abi, _wallet);

  console.log(`Minting Mock Tokens...`);
  await _erc20Mock.mint(_walletAddress, 10000n).then(tx => tx.wait());
  const tokenBalance = await _erc20Mock.balanceOf(_walletAddress);
  console.log(`Token Balance: ${tokenBalance}`);

  console.log(`Minting Mock NFT...`);
  const nftBalance = await _nftMock.balanceOf(_walletAddress);
  await _nftMock.mint(_walletAddress, nftBalance + 1n).then(tx => tx.wait());
  const newNftBalance = await _nftMock.balanceOf(_walletAddress);
  console.log(`New NFT Balance: ${newNftBalance}`);

  // Calculate Expected Account Address via Registry
  const tokenId = 1;
  const newAccountAddress = await calculateAccountAddress(_nftMockAddress, tokenId);
  console.log(`Expected Account Address: ${newAccountAddress}`);


  // Try to Create SmartAccount by calling the Registry directly
  const smartAccountHash = await _chargedParticles.getAccountBytecodeHash(_nftMockAddress);
  const txReceipt = await _zkSyncRegistry.createAccount(
    smartAccountHash,
    salt,
    chainId,
    _nftMockAddress,
    1,
  ).then(tx => tx.wait());
  console.log(`txReceipt = ${txReceipt}`);

  // Energize NFT in order to Create new Smart Account
  await _erc20Mock.approve(_chargedParticlesAddress, 100n).then(tx => tx.wait());
  const newAccountReceipt = await _chargedParticles.energizeParticle(
    _nftMockAddress,
    tokenId,
    _erc20MockAddress,
    100n,
  ).then(tx => tx.wait());
  console.log(`txReceipt = ${newAccountReceipt}`);
}