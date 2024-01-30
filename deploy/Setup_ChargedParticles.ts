import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
// import { ContractTransactionReceipt, EventLog, Log } from 'ethers';

const Setup_ChargedParticles: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	// const { network, deployments, ethers } = hre;
  // const chainId = network.config.chainId ?? 1;

  console.log(` -- TODO: Setup ChargedParticles ???`);

};
export default Setup_ChargedParticles;

Setup_ChargedParticles.dependencies = ['ChargedParticles'];
Setup_ChargedParticles.tags = ['Setup_ChargedParticles'];