import { ChargedParticles, Ionx, Lepton2, RewardProgram, UniverseRP } from '../typechain-types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, network } from 'hardhat';

import { addressBook } from '../utils/globals';
import { getChargedParticlesOwner } from '../utils/getSigners';
import { Signer } from 'ethers';


const RewardProgramSetupTestnet: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const deployerSigner = await ethers.getSigner(deployer);
  const chainId = network.config.chainId ?? 80001;

  const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles);
  const universe: UniverseRP = await ethers.getContract('UniverseRP');
  const lepton: Lepton2 = await ethers.getContract('Lepton2');
  const ionx: Ionx = await ethers.getContract('Ionx');

  const leptonAddress = await lepton.getAddress();
  const universeAddress = await universe.getAddress();
  const chargedParticlesOwner = await chargedParticles.owner();

  const isHardhat = network?.config?.forking?.enabled ?? false;

  let chargedParticlesOwnerSigner: Signer;
  if (isHardhat) {
    chargedParticlesOwnerSigner = await getChargedParticlesOwner();
    await deployerSigner.sendTransaction({ to: chargedParticlesOwner, value: ethers.parseEther('1') });
  } else {
    chargedParticlesOwnerSigner = deployerSigner;
  }

  // setup universe
  console.log(`  - Preparing UniverseRP...`);
  await universe.setChargedParticles(addressBook[chainId].chargedParticles);
  await universe.setMultiplierNft(leptonAddress).then(tx => tx.wait());

  // Register & Fund Reward Programs for each Staking Token
  for (let i = 0; i < addressBook[chainId].stakingTokens.length; i++) {
    const stakingToken = addressBook[chainId].stakingTokens[i];

    // fund reward program
    console.log(`  - Funding RewardProgram for ${stakingToken.id} with ${stakingToken.funding} IONX...`);
    const rewardProgram: RewardProgram = await ethers.getContract(`RewardProgram${stakingToken.id}`);
    const rewardProgramAddress = await rewardProgram.getAddress();
    await ionx.approve(rewardProgramAddress, ethers.parseEther(stakingToken.funding)).then(tx => tx.wait());
    await rewardProgram.fundProgram(ethers.parseEther(stakingToken.funding)).then(tx => tx.wait());

    // register reward program in universe
    console.log(`  -- Registering RewardProgram in the Universe...`);
    await universe.setRewardProgram(rewardProgramAddress, stakingToken.address);

    console.log(`  -- RewardProgram for ${stakingToken.id} is registered!`);
  }

  // setup charged particles
  console.log(`  - Registering UniverseRP in Charged Particles...`);
  await chargedParticles.connect(chargedParticlesOwnerSigner).setController(universeAddress, 'universe');
};

export default RewardProgramSetupTestnet;

RewardProgramSetupTestnet.dependencies = ['Lepton2', 'Ionx', 'RewardPrograms'];
RewardProgramSetupTestnet.tags = ['RPSetupTest'];
