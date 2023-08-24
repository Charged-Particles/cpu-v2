import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { Ionx } from '../typechain-types';

const Ionx: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments, getNamedAccounts, ethers, network } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();
  const isHardhat = network?.config?.forking?.enabled ?? false;

	await deploy('Ionx', {
		from: deployer,
		args: [],
		log: true,
	});

  !isHardhat && console.log(`  - Setting Minter and Minting 100,000,000 to deployer...`);
  const ionx: Ionx = await ethers.getContract('Ionx');
  await ionx.setMinter(deployer).then(tx => tx.wait());
  await ionx.mint(deployer, ethers.parseEther('10000000000')).then(tx => tx.wait());
};
export default Ionx;

Ionx.tags = ['Ionx'];