import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const SmartAccount_Deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const {deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;
	const {deployer} = await getNamedAccounts();

	await deploy('SmartAccount', {
		from: deployer,
		args: [
		],
		log: true,
	});
};
export default SmartAccount_Deploy;

SmartAccount_Deploy.tags = ['SmartAccount'];
