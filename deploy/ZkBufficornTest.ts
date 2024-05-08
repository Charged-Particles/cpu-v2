import * as hre from "hardhat";
import { Wallet, Provider, Contract } from "zksync-ethers";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { getProvider, getWallet } from '../utils/utils';

// zkSyncMainnet
import * as ChargedParticlesDeployData from '../deployments-zk/zkSyncMainnet/contracts/ChargedParticles.sol/ChargedParticles.json';
import * as BufficornDeployData from '../deployments-zk/zkSyncMainnet/contracts/tokens/BufficornZK.sol/BufficornZK.json';

// Addresses
const _chargedParticlesAddress: string = ChargedParticlesDeployData.entries[0].address;
const _bufficornAddress: string = BufficornDeployData.entries[0].address;

// Contracts
let _chargedParticles: Contract;
let _bufficorn: Contract;

// Wallets/Signers/Providers
let _provider: Provider;
let _wallet: Wallet;
let _walletAddress: string;
let _deployer: Deployer;

export default async function () {
  _provider = getProvider();
  _wallet = getWallet();
  _deployer = new Deployer(hre, _wallet);
  _walletAddress = _wallet.address;

  console.log(`Minting on zkSyncMainnet...`);

  // Load Charged Particles
  console.log(` -- Loading Charged Particles from Address: ${_chargedParticlesAddress}`);
  _chargedParticles = new Contract(_chargedParticlesAddress, ChargedParticlesDeployData.abi, _wallet);

  // Load Bufficorn
  console.log(` -- Loading Bufficorn from Address: ${_bufficornAddress}`);
  _bufficorn = new Contract(_bufficornAddress, BufficornDeployData.abi, _wallet);

  const containerNft = 1n;
  const trait1 = 2n;
  const trait2 = 3n;
  const trait3 = 4n;

  console.log(`Minting Bufficorn NFT...`);
  await _bufficorn.mint(containerNft).then(tx => tx.wait());

  console.log(`Minting 3 Bufficorn Trait NFTs...`);
  await _bufficorn.mintWithTraits(trait1, 1n).then(tx => tx.wait());
  await _bufficorn.mintWithTraits(trait2, 2n).then(tx => tx.wait());
  await _bufficorn.mintWithTraits(trait3, 4n).then(tx => tx.wait());

  // Bond NFT with Trait-Swapper Tech!
  await _bufficorn.setApprovalForAll(_chargedParticlesAddress, true).then(tx => tx.wait());
  console.log(`Nesting Trait NFT "${trait1}" into Container "${containerNft}"`);
  await _chargedParticles.covalentBond(_bufficornAddress, containerNft, _bufficornAddress, trait1, 1).then(tx => tx.wait());
  console.log(`Nesting Trait NFT "${trait2}" into Container "${containerNft}"`);
  await _chargedParticles.covalentBond(_bufficornAddress, containerNft, _bufficornAddress, trait2, 1).then(tx => tx.wait());
  console.log(`Nesting Trait NFT "${trait3}" into Container "${containerNft}"`);
  await _chargedParticles.covalentBond(_bufficornAddress, containerNft, _bufficornAddress, trait3, 1).then(tx => tx.wait());

  console.log(`Minting Complete!!`);
}