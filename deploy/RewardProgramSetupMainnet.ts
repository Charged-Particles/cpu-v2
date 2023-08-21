import { ChargedParticles, Ionx, Lepton2, RewardProgram, RewardProgramFactory, UniverseRP } from '../typechain-types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

import { addressBook } from '../utils/globals';

const RewardProgramSetupMainnet: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { network, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const deployerSigner = await ethers.getSigner(deployer);
  const chainId = network.config.chainId ?? 1;

  const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles);
  const lepton: Lepton2 = await ethers.getContractAt('Lepton2', addressBook[chainId].lepton);
  const ionx: Ionx = await ethers.getContractAt('Ionx', addressBook[chainId].ionx);

  const rewardProgram: RewardProgram = await ethers.getContract('RewardProgramDAI');
  const universe: UniverseRP = await ethers.getContract('UniverseRP');

  const leptonAddress = await lepton.getAddress();
  const universeAddress = await universe.getAddress();
  const rewardProgramAddress = await rewardProgram.getAddress();
  const daiAddress = addressBook[chainId].dai;

  // fund reward program
  await ionx.approve(rewardProgramAddress, ethers.parseEther('10')).then(tx => tx.wait());
  await rewardProgram.fundProgram(ethers.parseEther('10')).then(tx => tx.wait());

  // setup universe
  await universe.setChargedParticles(addressBook[chainId].chargedParticles);
  await universe.setMultiplierNft(leptonAddress).then(tx => tx.wait());
  await universe.setRewardProgram(rewardProgramAddress, daiAddress);

  // setup charged particles
  await chargedParticles.connect(deployerSigner).setController(universeAddress, 'universe');
};

export default RewardProgramSetupMainnet;

RewardProgramSetupMainnet.tags = ['RPSetupMain'];
RewardProgramSetupMainnet.dependencies = ['RewardProgramFactoryDAI'];
