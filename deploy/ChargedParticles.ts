import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { SmartAccountController_Example1 } from '../typechain-types';

const ChargedParticles_Deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const {ethers, deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;

	const { deployer } = await getNamedAccounts();

  // Load SmartAccountController_Example1
  const controller: SmartAccountController_Example1 = await ethers.getContract('SmartAccountController_Example1');
  const controllerAddress = await controller.getAddress();

	await deploy('ChargedParticles', {
		from: deployer,
		args: [controllerAddress],
		log: true,
	});
};
export default ChargedParticles_Deploy;

ChargedParticles_Deploy.dependencies = ['SAC_EX1'];
ChargedParticles_Deploy.tags = ['ChargedParticles'];
