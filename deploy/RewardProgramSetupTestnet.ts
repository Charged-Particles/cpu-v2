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
    'chargedParticles': '0xaB1a1410EA40930755C1330Cc0fB3367897C8c41'
  },
  31337: {
    'chargedManager': '0x7b07Ec627d2426b89C44a6cC75Dc57c27a52174d',
    'chargedParticles': '0xaB1a1410EA40930755C1330Cc0fB3367897C8c41'
  },
  80001: {
    'chargedManager': '0xE8c6462ceEeeC3f8c318e29Af143f623de979D69',
    'chargedParticles': '0x51f845af34c60499a1056FCDf47BcBC681A0fA39'
  }
}

const RewardProgramSetupTestnet: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { network, getNamedAccounts } = hre;

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

  const chargedParticlesOwner = await chargedParticles.owner();

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [ chargedParticlesOwner ],
  });

  const chargedParticlesOwnerSigner = await ethers.getSigner(chargedParticlesOwner);
  const deployerSigner = await ethers.getSigner(deployer);

  // fund charged owner
  await deployerSigner.sendTransaction({ to: chargedParticlesOwner, value: ethers.parseEther('1') });

  // setup reward program
  await rewardProgram.setRewardToken(ionxAddress).then(tx => tx.wait());
  await rewardProgram.setRewardNft(leptonAddress).then(tx => tx.wait());
  await rewardProgram.setUniverse(universeAddress).then(tx => tx.wait());
  await rewardProgram.setChargedManagers(addressBook[chainId].chargedManager).then(tx => tx.wait());
  await rewardProgram.setBaseMultiplier(ionxAddress , '10000');

  // setup universe
  await universe.setRewardProgram(await rewardProgram.getAddress(), ionxAddress, leptonAddress);
  await universe.setChargedParticles(addressBook[chainId].chargedParticles);

  // setup charged particles
  await chargedParticles.connect(chargedParticlesOwnerSigner).setController(universeAddress, 'universe');
};
export default RewardProgramSetupTestnet;

RewardProgramSetupTestnet.tags = ['RPSetupTest'];
RewardProgramSetupTestnet.dependencies = ['Ionx', 'Lepton2', 'RewardProgram', 'UniverseRP'];
