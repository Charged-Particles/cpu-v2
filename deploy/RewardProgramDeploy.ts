import { Ionx, RewardProgram, UniverseRP } from '../typechain-types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import { isTestnet } from '../utils/isTestnet';
import { isHardhat } from '../utils/isHardhat';
import { addressBook } from '../utils/globals';
import { verifyContract } from '../utils/verifyContract';

const RewardProgramDeploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { network } = hre;
  const chainId = network.config.chainId ?? 1;

  // Load IONX
  let ionx: Ionx;
  if (!isHardhat() && addressBook[chainId].ionx.length > 0) {
    ionx = await ethers.getContractAt('Ionx', addressBook[chainId].ionx);
  } else {
    ionx = await ethers.getContract('Ionx');
  }

  // const ionxAddress = await ionx.getAddress();
  const universe: UniverseRP = await ethers.getContract('UniverseRP');

  // Register & Fund Reward Programs for each Staking Token
  for (let i = 0; i < addressBook[chainId].stakingTokens.length; i++) {
    const stakingToken = addressBook[chainId].stakingTokens[i];
    const rewardProgram: RewardProgram = await ethers.getContract(`RewardProgram${stakingToken.id}`);
    const rewardProgramAddress = await rewardProgram.getAddress();

    // verify reward program
    if (!isTestnet() && !isHardhat()) {
      await verifyContract(`RewardProgram${stakingToken.id}`, rewardProgram);
    }

    // fund reward program
    console.log(`  - Funding RewardProgram for ${stakingToken.id} with ${stakingToken.funding} IONX...`);
    await ionx.approve(rewardProgramAddress, ethers.parseEther(stakingToken.funding)).then(tx => tx.wait());
    await rewardProgram.fundProgram(ethers.parseEther(stakingToken.funding)).then(tx => tx.wait());

    // register reward program in universe
    console.log(`    -- Registering RewardProgram in the Universe...`);
    await universe.setRewardProgram(rewardProgramAddress, stakingToken.address);

    console.log(`    -- RewardProgram for ${stakingToken.id} is registered!`);
  }
};

export default RewardProgramDeploy;

RewardProgramDeploy.dependencies = ['RewardPrograms'];
RewardProgramDeploy.tags = ['RPDeploy'];
