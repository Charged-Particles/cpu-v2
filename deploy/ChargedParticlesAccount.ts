import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const ChargedParticlesAccountDeploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const {deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;

	const { deployer } = await getNamedAccounts();

	await deploy('ChargedParticlesAccount', {
		from: deployer,
		args: [],
		log: true,
	});
};
export default ChargedParticlesAccountDeploy;

ChargedParticlesAccountDeploy.tags = ['ChargedParticlesAccount'];