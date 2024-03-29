import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { verifyContract } from '../utils/verifyContract';
import { isTestnet } from '../utils/isTestnet';
import { Ionx, Lepton2 } from '../typechain-types';

const LeptonStore: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

    let lepton: Lepton2 ;
	let ionx: Ionx;

	lepton = await ethers.getContract('Lepton2');
	ionx = await ethers.getContract('Ionx');

	// if (isTestnet()) {
	// 	lepton = await ethers.getContract('Lepton2');
	// 	ionx = await ethers.getContract('Ionx');
	// } else {
	// 	lepton = await ethers.getContractAt('Lepton2', '0x3Cd2410EAa9c2dCE50aF6CCAb72Dc93879a09c1F');
	// 	ionx = await ethers.getContractAt('Ionx', '0x02D3A27Ac3f55d5D91Fb0f52759842696a864217');
	// }
	
    const leptonAddress = await lepton.getAddress();
	const ionxAddress = await ionx.getAddress();
	const leptonPrice = 1;

	console.log(leptonAddress, ionxAddress, deployer);

	console.log(leptonAddress, ionxAddress, leptonPrice);
	await deploy('LeptonsStore', {
		from: deployer,
		args: [ leptonAddress, ionxAddress, leptonPrice ],
		log: true,
	});

  console.log(`  - Leptons Store Deployed...`);

  if (!isTestnet()) {
    await verifyContract('LeptonsStore', await ethers.getContract('LeptonsStore'));
  }
};
export default LeptonStore;

LeptonStore.tags = ['LeptonsStore'];
