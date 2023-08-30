import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { verifyContract } from '../utils/verifyContract';

const UniverseRP: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

	await deploy('UniverseRP', {
		from: deployer,
		args: [],
		log: true,
    proxy: {
      proxyContract: 'OpenZeppelinTransparentProxy',
      methodName: 'initialize',
    },
	});
  console.log(`  - UniverseRP Deployed...`);

  await verifyContract('UniverseRP', await ethers.getContract('UniverseRP'));
};
export default UniverseRP;

UniverseRP.tags = ['UniverseRP'];