import { ChargedParticles, Ionx, Lepton2, RewardProgram, RewardProgramFactory, UniverseRP } from '../typechain-types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

import { addressBook } from '../utils/globals';
import { getChargedParticlesOwner } from '../utils/getSigners';
import { Signer } from 'ethers';


const RewardProgramSetupTestnet: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { network, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const deployerSigner = await ethers.getSigner(deployer);
  const chainId = network.config.chainId ?? 80001;

  const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles);
  const rewardProgram: RewardProgram = await ethers.getContract('RewardProgramIONX');
  const universe: UniverseRP = await ethers.getContract('UniverseRP');
  const lepton: Lepton2 = await ethers.getContract('Lepton2');
  const ionx: Ionx = await ethers.getContract('Ionx');

  const ionxAddress = await ionx.getAddress();
  const leptonAddress = await lepton.getAddress();
  const universeAddress = await universe.getAddress();
  const rewardProgramAddress = await rewardProgram.getAddress();
  const chargedParticlesOwner = await chargedParticles.owner();

  let chargedParticlesOwnerSigner: Signer;
  if (chainId === 80001) {
    chargedParticlesOwnerSigner = deployerSigner;
  } else {
    chargedParticlesOwnerSigner = await getChargedParticlesOwner();
    await deployerSigner.sendTransaction({ to: chargedParticlesOwner, value: ethers.parseEther('1') });
  }

  // fund reward program
  await ionx.approve(rewardProgramAddress, ethers.parseEther('100')).then(tx => tx.wait());
  await rewardProgram.fundProgram(ethers.parseEther('100')).then(tx => tx.wait());

  // setup universe
  await universe.setChargedParticles(addressBook[chainId].chargedParticles);
  await universe.setMultiplierNft(leptonAddress).then(tx => tx.wait());
  await universe.setRewardProgram(rewardProgramAddress, ionxAddress);

  // setup charged particles
  await chargedParticles.connect(chargedParticlesOwnerSigner).setController(universeAddress, 'universe');
};

export default RewardProgramSetupTestnet;

RewardProgramSetupTestnet.tags = ['RPSetupTest'];
RewardProgramSetupTestnet.dependencies = ['Ionx', 'Lepton2', 'RewardProgramFactory'];
