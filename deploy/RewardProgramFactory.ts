import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { RewardProgramFactory } from '../typechain-types';
import { verifyContract } from '../utils/verifyContract';
import { isTestnet } from '../utils/isTestnet';

const RewardProgramFactory: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

	await deploy('RewardProgramFactory', {
		from: deployer,
		args: [],
		log: true,
	});
  console.log(`  - RewardProgramFactory Deployed...`);

  if (!isTestnet()) {
    await verifyContract('RewardProgramFactory', await ethers.getContract('RewardProgramFactory'));
  }
};
export default RewardProgramFactory;

RewardProgramFactory.tags = ['RewardProgramFactory'];