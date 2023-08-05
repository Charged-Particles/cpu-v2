import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

import { ChargedParticles, Ionx, Lepton2, RewardProgram, UniverseRP } from '../typechain-types';

interface AddressBook {
  [chainId: number]: {
    chargedManager: string;
    chargedParticles: string;
  };
}

const addressBook: AddressBook = {
  1: {
    'chargedManager': '0x7b07Ec627d2426b89C44a6cC75Dc57c27a52174d',
    'chargedParticles': '0x2691B4f4251408bA4b8bf9530B6961b9D0C1231F'
  },
  31337: {
    'chargedManager': '0x7b07Ec627d2426b89C44a6cC75Dc57c27a52174d',
    'chargedParticles': '0x2691B4f4251408bA4b8bf9530B6961b9D0C1231F'
  },
  80001: {
    'chargedManager': '0xE8c6462ceEeeC3f8c318e29Af143f623de979D69',
    'chargedParticles': '0x660De54CEA09838d11Df0812E2754eD8D08CD2f7'
  }
}

const RewardProgramSetupTestnet: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const {deployments, getNamedAccounts, network} = hre;
	const {deploy} = deployments;

	const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId ?? 80001;

  const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles);
  const rewardProgram: RewardProgram = await ethers.getContract('RewardProgram');
  const universe: UniverseRP = await ethers.getContract('UniverseRP');
  const lepton: Lepton2 = await ethers.getContract('Lepton2');
  const ionx: Ionx = await ethers.getContract('Ionx');

  const ionxAddress = await ionx.getAddress();
  const leptonAddress = await lepton.getAddress();
  const universeAddress = await universe.getAddress();

  // setup reward program
  await rewardProgram.setRewardToken(ionxAddress).then(tx => tx.wait());
  await rewardProgram.setRewardNft(leptonAddress).then(tx => tx.wait());
  await rewardProgram.setUniverse(universeAddress).then(tx => tx.wait());
  await rewardProgram.setChargedManagers(addressBook[chainId].chargedManager).then(tx => tx.wait());
  await rewardProgram.setBaseMultiplier(ionxAddress , '10000');

  // setup universe
  await universe.setRewardProgram(await rewardProgram.getAddress(), ionxAddress, leptonAddress);
  await universe.setChargedParticles(addressBook[chainId].chargedParticles);

  // // setup charged particles
  await chargedParticles.setController(universeAddress, 'universe');


};
export default RewardProgramSetupTestnet;

RewardProgramSetupTestnet.tags = ['RPSetupTest'];
RewardProgramSetupTestnet.dependencies = ['Ionx', 'Lepton2', 'RewardProgram', 'UniverseRP'];
