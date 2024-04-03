import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { verifyContract } from '../utils/verifyContract';
import { isTestnet } from '../utils/isTestnet';
import { isHardhat } from '../utils/isHardhat';
import { Ionx, Lepton2 } from '../typechain-types';

const LeptonStore: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

  let lepton: Lepton2;
	let ionx: Ionx;

	if (isTestnet() || isHardhat()) {
		lepton = await ethers.getContract('Lepton2');
		ionx = await ethers.getContract('Ionx');
	} else {
		lepton = await ethers.getContractAt('Lepton2', '0x3Cd2410EAa9c2dCE50aF6CCAb72Dc93879a09c1F');
		ionx = await ethers.getContractAt('Ionx', '0x02D3A27Ac3f55d5D91Fb0f52759842696a864217');
	}

  const leptonAddress = await lepton.getAddress();
	const ionxAddress = await ionx.getAddress();
	const leptonPrice = (isTestnet() || isHardhat()) ? 1 : ethers.parseEther('15000'); // in IONX

  console.log(`Deployer = "${deployer}"`);
  console.log('Deploying LeptonsStore with:');
  console.log(`Lepton Address: "${leptonAddress}"`);
  console.log(`IONX Address: "${ionxAddress}"`);
  console.log(`Lepton Price: "${leptonPrice}"`);

	await deploy('LeptonsStore', {
		from: deployer,
		args: [ leptonAddress, ionxAddress, leptonPrice ],
		log: true,
	});

  console.log(`  - Leptons Store Deployed...`);

  if (!isTestnet() && !isHardhat()) {
    await verifyContract('LeptonsStore', await ethers.getContract('LeptonsStore'), [ leptonAddress, ionxAddress, leptonPrice ]);
  }
};
export default LeptonStore;

LeptonStore.tags = ['LeptonsStore'];