import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { Ionx } from '../typechain-types';
import { addressBook } from '../utils/globals';
import { parseEther } from 'ethers';

const Ionx: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments, getNamedAccounts, ethers, network } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

  console.log(deployer)
  const chainId = network.config.chainId ?? 1;

  // Check for Previously Deployed Version
  await deploy('Ionx', {
    from: deployer,
    args: [],
    log: true,
    skipIfAlreadyDeployed: true
  });
  console.log(`  - IONX Deployed...`);

  console.log(`  - Setting Minter and Minting 100,000,000 to deployer...`);
  const ionx: Ionx = await ethers.getContract('Ionx', deployer);
  await ionx.transfer('0xEdbbdB06eAAeb5Ba283a819eB8bBbe956c3cfeBb', parseEther('1000')).then(tx => tx.wait());
  // await ionx.setMinter(deployer).then(tx => tx.wait());
  // await ionx.mint(deployer, ethers.parseEther('10000000000')).then(tx => tx.wait());
};
export default Ionx;

Ionx.tags = ['Ionx'];