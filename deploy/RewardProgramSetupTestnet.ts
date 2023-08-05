import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

import { Ionx, Lepton2, RewardProgram, UniverseRP } from '../typechain-types';

interface AddressBook {
  [chainId: number]: {
    chargedManager: string;
  };
}

const addressBook: AddressBook = {
  1: {
    'chargedManager': '0x7b07Ec627d2426b89C44a6cC75Dc57c27a52174d',
  },
  31337: {
    'chargedManager': '0x7b07Ec627d2426b89C44a6cC75Dc57c27a52174d',
  },
  80001: {
    'chargedManager': '0xE8c6462ceEeeC3f8c318e29Af143f623de979D69',
  }
}

const RewardProgramSetupTestnet: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const {deployments, getNamedAccounts, network} = hre;
	const {deploy} = deployments;

	const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId ?? 80001;

  const rewardProgram: RewardProgram = await ethers.getContract('RewardProgram');
  const universe: UniverseRP = await ethers.getContract('UniverseRP');
  const ionx: Ionx = await ethers.getContract('Ionx');
  const lepton: Lepton2 = await ethers.getContract('Lepton2');

  await rewardProgram.setRewardToken(await ionx.getAddress()).then(tx => tx.wait());
  await rewardProgram.setRewardNft(await lepton.getAddress()).then(tx => tx.wait());
  await rewardProgram.setChargedManagers(addressBook[chainId].chargedManager).then(tx => tx.wait());

};
export default RewardProgramSetupTestnet;

RewardProgramSetupTestnet.tags = ['RPSetupTest'];
RewardProgramSetupTestnet.dependencies = ['Ionx', 'Lepton2', 'RewardProgram', 'UniverseRP'];
