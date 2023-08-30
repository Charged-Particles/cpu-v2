import { ChargedParticles, Lepton2, UniverseRP } from '../typechain-types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, network } from 'hardhat';

import { isHardhat } from '../utils/isHardhat';
import { addressBook } from '../utils/globals';
import { getChargedParticlesOwner } from '../utils/getSigners';
import { Signer } from 'ethers';


const RewardProgramSetupTestnet: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const deployerSigner = await ethers.getSigner(deployer);
  const chainId = network.config.chainId ?? 80001;
  const _isHardhat = isHardhat();

  const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles);
  const universe: UniverseRP = await ethers.getContract('UniverseRP');

  // Load Lepton2
  let lepton: Lepton2;
  if (addressBook[chainId].lepton.length > 0) {
    lepton = await ethers.getContractAt('Lepton2', addressBook[chainId].lepton);
  } else {
    lepton = await ethers.getContract('Lepton2');
  }

  const leptonAddress = await lepton.getAddress();
  const universeAddress = await universe.getAddress();
  const chargedParticlesOwner = await chargedParticles.owner();

  let chargedParticlesOwnerSigner: Signer;
  if (_isHardhat) {
    chargedParticlesOwnerSigner = await getChargedParticlesOwner();
    await deployerSigner.sendTransaction({ to: chargedParticlesOwner, value: ethers.parseEther('1') });
  } else {
    chargedParticlesOwnerSigner = deployerSigner;
  }

  // setup universe
  console.log(`  - Preparing UniverseRP...`);
  await universe.setChargedParticles(addressBook[chainId].chargedParticles);
  await universe.setMultiplierNft(leptonAddress).then(tx => tx.wait());

  // setup charged particles
  console.log(`  - Registering UniverseRP in Charged Particles...`);
  await chargedParticles.connect(chargedParticlesOwnerSigner).setController(universeAddress, 'universe');
};

export default RewardProgramSetupTestnet;

RewardProgramSetupTestnet.dependencies = ['Lepton2', 'Ionx', 'RewardPrograms'];
RewardProgramSetupTestnet.tags = ['RPSetupTest'];
