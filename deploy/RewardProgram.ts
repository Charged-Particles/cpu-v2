import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const RewardProgram: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const {deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;

	const { deployer } = await getNamedAccounts();

	await deploy('RewardProgram', {
		from: deployer,
		args: [],
		log: true,
	});
};
export default RewardProgram;

RewardProgram.tags = ['RewardProgram'];