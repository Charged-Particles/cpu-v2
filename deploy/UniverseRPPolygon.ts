import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { verifyContract } from '../utils/verifyContract';
import { isTestnet } from '../utils/isTestnet';
import { isHardhat } from '../utils/isHardhat';

const UniverseRPPolygon: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { network, ethers, deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId ?? 1;

  if (chainId !== 137 && chainId !== 80001) {
    console.log(`  - Wrong Network - Polygon Only`);
    return;
  }

	await deploy('UniverseRPPolygon', {
		from: deployer,
		args: [],
		log: true,
    proxy: {
      proxyContract: 'OpenZeppelinTransparentProxy',
      methodName: 'initialize',
    },
	});
  console.log(`  - UniverseRP Deployed...`);

  if (!isTestnet() && !isHardhat()) {
    await verifyContract('UniverseRPPolygon', await ethers.getContract('UniverseRPPolygon'));
  }
};
export default UniverseRPPolygon;

UniverseRPPolygon.tags = ['UniverseRPPolygon'];