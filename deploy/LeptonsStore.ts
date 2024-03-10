import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { verifyContract } from '../utils/verifyContract';
import { isTestnet } from '../utils/isTestnet';

const LeptonStore: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

    const lepton = await ethers.getContract('Lepton2');
    const leptonAddress = await lepton.getAddress();

	await deploy('LeptonsStore', {
		from: deployer,
		args: [ leptonAddress ],
		log: true,
	});

  console.log(`  - Leptons Store Deployed...`);

  if (!isTestnet()) {
    await verifyContract('LeptonsStore', await ethers.getContract('LeptonsStore'));
  }
};
export default LeptonStore;

LeptonStore.tags = ['LeptonsStore'];