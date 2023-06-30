import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const DeployChargedParticles: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const {deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;

	const { deployer } = await getNamedAccounts();

	await deploy('ChargedParticles', {
		from: deployer,
		args: [],
		log: true,
	});
};
export default DeployChargedParticles;

DeployChargedParticles.tags = ['ChargedParticles'];