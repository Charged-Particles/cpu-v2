import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { Ionx, RewardProgramFactory, UniverseRP } from '../typechain-types';
import { ContractTransactionReceipt, EventLog, Log } from 'ethers';
import { ethers } from 'hardhat';
import { addressBook } from '../utils/globals';
import * as RewardProgramJson from '../build/contracts/contracts/v1/incentives/RewardProgram.sol/RewardProgram.json';

const RewardProgramFactory: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const {network, deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;
	const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId ?? 80001;

  const universe: UniverseRP = await ethers.getContract('UniverseRP');
  const ionx: Ionx = await ethers.getContract('Ionx');

  const ionxAddress = await ionx.getAddress();
  const universeAddress = await universe.getAddress();
  const daiAddress = addressBook[chainId].usdc;

	await deploy('RewardProgramFactory', {
		from: deployer,
		args: [],
		log: true,
	});

  // Deploy reward program from factory
  const rewardProgramFactory: RewardProgramFactory = await ethers.getContract('RewardProgramFactory');
  const tx = await rewardProgramFactory.createRewardProgram(
    daiAddress,
    ionxAddress,
    '10000',
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
    await deployments.save('RewardProgramUSDc', {
      abi: RewardProgramJson.abi,
      address: rewardProgramAddress,
      transactionHash: tx.hash,
    });
  }
};
export default RewardProgramFactory;

RewardProgramFactory.dependencies = ['UniverseRP'];
RewardProgramFactory.tags = ['RewardProgramFactoryUSDc'];