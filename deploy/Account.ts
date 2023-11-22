import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const MinimalisticAccountDeploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const {deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;

	const { deployer } = await getNamedAccounts();

	await deploy('Account', {
		from: deployer,
		args: [],
		log: true,
	});
};
export default MinimalisticAccountDeploy;

MinimalisticAccountDeploy.tags = ['Account'];