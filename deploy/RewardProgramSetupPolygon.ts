import { ChargedParticles, Lepton2, UniverseRP } from '../typechain-types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

import { addressBook } from '../utils/globals';

const RewardProgramSetupPolygon: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { network, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const deployerSigner = await ethers.getSigner(deployer);
  const chainId = network.config.chainId ?? 1;

  const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles);
  const lepton: Lepton2 = await ethers.getContractAt('Lepton2', addressBook[chainId].lepton);
  const universe: UniverseRP = await ethers.getContract('UniverseRPPolygon');

  const leptonAddress = await lepton.getAddress();
  const universeAddress = await universe.getAddress();

  // setup universe
  console.log(`Preparing UniverseRP...`);
  await universe.setChargedParticles(addressBook[chainId].chargedParticles);
  await universe.setMultiplierNft(leptonAddress).then(tx => tx.wait());

  // finally: setup charged particles
  console.log(`Registering UniverseRP in Charged Particles...`);
  await chargedParticles.connect(deployerSigner).setController(universeAddress, 'universe');
};

export default RewardProgramSetupPolygon;

RewardProgramSetupPolygon.dependencies = ['UniverseRPPolygon'];
RewardProgramSetupPolygon.tags = ['RPSetupPolygon'];
