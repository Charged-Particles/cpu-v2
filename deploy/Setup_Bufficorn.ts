import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ChargedParticles, BufficornZK } from '../typechain-types';
import { performTx } from '../utils/performTx';
// import { isTestnet } from '../utils/isTestnet';

const Setup_Bufficorn: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { network, deployments, ethers } = hre;
  // const chainId = network.config.chainId ?? 1;

  // Load ChargedParticles
  const chargedParticles: ChargedParticles = await ethers.getContract('ChargedParticles');
  const chargedParticlesAddress = await chargedParticles.getAddress();

  // Load Bufficorn
  const bufficorn: BufficornZK = await ethers.getContract('BufficornZK');
  const bufficornAddress = await bufficorn.getAddress();

  // Set Custom Execution Controller as the BufficornZK contract
  await performTx(
    await chargedParticles.setCustomExecutionController(bufficornAddress, bufficornAddress),
    ' -- Custom Implementation Created for Bufficorn SmartAccounts'
  );
};
export default Setup_Bufficorn;

Setup_Bufficorn.dependencies = ['Setup_CPU', 'BufficornZK'];
Setup_Bufficorn.tags = ['Setup_Bufficorn'];