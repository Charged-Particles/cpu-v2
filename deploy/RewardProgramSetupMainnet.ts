import { ChargedParticles, Ionx, Lepton2, RewardProgram, UniverseRP } from '../typechain-types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
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
  const universe: UniverseRP = await ethers.getContract('UniverseRP');

  const leptonAddress = await lepton.getAddress();
  const universeAddress = await universe.getAddress();

  // setup universe
  console.log(`Preparing UniverseRP...`);
  await universe.setChargedParticles(addressBook[chainId].chargedParticles);
  await universe.setMultiplierNft(leptonAddress).then(tx => tx.wait());

  // setup charged particles
  console.log(`Registering UniverseRP in Charged Particles...`);
  await chargedParticles.connect(deployerSigner).setController(universeAddress, 'universe');

  // Register & Fund Reward Programs for each Staking Token
  for (let i = 0; i < addressBook[chainId].stakingTokens.length; i++) {
    const stakingToken = addressBook[chainId].stakingTokens[i];

    // fund reward program
    console.log(`Funding RewardProgram for ${stakingToken.id} with ${stakingToken.funding} IONX...`);
    const rewardProgram: RewardProgram = await ethers.getContract(`RewardProgram${stakingToken.id}`);
    const rewardProgramAddress = await rewardProgram.getAddress();
    await ionx.approve(rewardProgramAddress, ethers.parseEther(stakingToken.funding)).then(tx => tx.wait());
    await rewardProgram.fundProgram(ethers.parseEther(stakingToken.funding)).then(tx => tx.wait());

    // register reward program in universe
    console.log(`Registering RewardProgram in the Universe...`);
    await universe.setRewardProgram(rewardProgramAddress, stakingToken.address);

    console.log(`RewardProgram for ${stakingToken.id} is registered!`);
  }
};

export default RewardProgramSetupMainnet;

RewardProgramSetupMainnet.dependencies = ['RewardPrograms'];
RewardProgramSetupMainnet.tags = ['RPSetupMain'];
