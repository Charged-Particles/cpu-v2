import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const ChargedParticles_Deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const {deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;
	const {deployer} = await getNamedAccounts();

	await deploy('ChargedParticles', {
		from: deployer,
		args: [],
		log: true,
	});
};
export default ChargedParticles_Deploy;

ChargedParticles_Deploy.tags = ['CPU'];
