import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { RewardProgramFactory } from '../typechain-types';

const RewardProgramFactory: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

	await deploy('RewardProgramFactory', {
		from: deployer,
		args: [],
		log: true,
	});
};
export default RewardProgramFactory;

RewardProgramFactory.tags = ['RewardProgramFactory'];