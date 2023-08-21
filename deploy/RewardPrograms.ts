import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { Ionx, RewardProgramFactory, UniverseRP } from '../typechain-types';
import { ContractTransactionReceipt, EventLog, Log } from 'ethers';
import { ethers } from 'hardhat';
import { addressBook } from '../utils/globals';
import * as RewardProgramJson from '../build/contracts/contracts/v1/incentives/RewardProgram.sol/RewardProgram.json';

const RewardPrograms: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { network, deployments } = hre;
  const chainId = network.config.chainId ?? 80001;

  // Load IONX
  let ionx: Ionx;
  if (chainId === 1) {
    ionx = await ethers.getContractAt('Ionx', addressBook[chainId].ionx)
  } else {
    ionx = await ethers.getContract('Ionx')
  }
  const ionxAddress = await ionx.getAddress();

  // Load Universe
  const universe: UniverseRP = await ethers.getContract('UniverseRP');
  const universeAddress = await universe.getAddress();

  // Load RewardProgramFactory
  const rewardProgramFactory: RewardProgramFactory = await ethers.getContract('RewardProgramFactory');


  // Deploy Reward Programs for each Staking Token
  for (let i = 0; i < addressBook[chainId].stakingTokens.length; i++) {
    const stakingToken = addressBook[chainId].stakingTokens[i];

    console.log(`  - Deploying RewardProgram for ${stakingToken.id}...`);
    const tx = await rewardProgramFactory.createRewardProgram(
      stakingToken.address,
      ionxAddress,
      stakingToken.multiplier,
      addressBook[chainId].chargedManager,
      universeAddress,
    );

    // Get reward program address
    let rewardProgramAddress: string;
    const rc: ContractTransactionReceipt | null = await tx.wait();
    if (rc !== null) {
      const evt: EventLog | Log = rc.logs[0];
      rewardProgramAddress = evt.args[0];

      // save to deployments
      console.log(`  -- Saving RewardProgram Deployment at address ${rewardProgramAddress}...`);
      await deployments.save(`RewardProgram${stakingToken.id}`, {
        abi: RewardProgramJson.abi,
        address: rewardProgramAddress,
        transactionHash: tx.hash,
      });

      console.log(`  -- RewardProgram for ${stakingToken.id} is deployed!`);
    }
  }

};
export default RewardPrograms;

RewardPrograms.dependencies = ['Ionx', 'UniverseRP', 'RewardProgramFactory'];
RewardPrograms.tags = ['RewardPrograms'];