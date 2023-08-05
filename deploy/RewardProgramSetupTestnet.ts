import { ChargedParticles, Ionx, Lepton2, RewardProgram, UniverseRP } from '../typechain-types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

import { addressBook } from '../utils/globals';
import { getChargedParticlesOwner } from '../utils/getSigners';


const RewardProgramSetupTestnet: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { network, getNamedAccounts } = hre;

  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId ?? 80001;

  const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles);
  const rewardProgram: RewardProgram = await ethers.getContract('RewardProgram');
  const universe: UniverseRP = await ethers.getContract('UniverseRP');
  const lepton: Lepton2 = await ethers.getContract('Lepton2');
  const ionx: Ionx = await ethers.getContract('Ionx');

  const ionxAddress = await ionx.getAddress();
  const leptonAddress = await lepton.getAddress();
  const universeAddress = await universe.getAddress();
  const rewardProgramAddress = await rewardProgram.getAddress();

  const chargedParticlesOwner = await chargedParticles.owner();

  const deployerSigner = await ethers.getSigner(deployer);
  const chargedParticlesOwnerSigner = await getChargedParticlesOwner();

  // fund charged owner
  await deployerSigner.sendTransaction({ to: chargedParticlesOwner, value: ethers.parseEther('1') });

  // setup reward program
  await rewardProgram.setRewardToken(ionxAddress).then(tx => tx.wait());
  await rewardProgram.setRewardNft(leptonAddress).then(tx => tx.wait());
  await rewardProgram.setUniverse(universeAddress).then(tx => tx.wait());
  await rewardProgram.setChargedManagers(addressBook[chainId].chargedManager).then(tx => tx.wait());
  await rewardProgram.setBaseMultiplier(ionxAddress , '10000');

  await ionx.approve(rewardProgramAddress, ethers.parseEther('100')).then(tx => tx.wait());
  await rewardProgram.fundProgram(ethers.parseEther('100')).then(tx => tx.wait());

  // setup universe
  await universe.setRewardProgram(await rewardProgram.getAddress(), ionxAddress, leptonAddress);
  await universe.setChargedParticles(addressBook[chainId].chargedParticles);

  // setup charged particles
  await chargedParticles.connect(chargedParticlesOwnerSigner).setController(universeAddress, 'universe');
};
export default RewardProgramSetupTestnet;

RewardProgramSetupTestnet.tags = ['RPSetupTest'];
RewardProgramSetupTestnet.dependencies = ['Ionx', 'Lepton2', 'RewardProgram', 'UniverseRP'];
