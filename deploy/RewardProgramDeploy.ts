import { Ionx, RewardProgram, UniverseRP } from '../typechain-types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, getNamedAccounts } from 'hardhat';
import { isTestnet } from '../utils/isTestnet';
import { isHardhat } from '../utils/isHardhat';
import { addressBook } from '../utils/globals';
import { verifyContract } from '../utils/verifyContract';
import { getChargedParticlesOwner } from '../utils/getSigners';
import { parseEther } from 'ethers';

const RewardProgramDeploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { network } = hre;
  const chainId = network.config.chainId ?? 1;

  // Load IONX
  let ionx: Ionx;
  if (!isHardhat() && addressBook[chainId].ionx.length > 0) {
    const { deployer } = await getNamedAccounts();
    ionx = await ethers.getContractAt('Ionx', addressBook[chainId].ionx, await ethers.getSigner(deployer));
    // fund signer
    const ionxOwner = await ionx.owner();
    await ionx.connect(await ethers.getSigner(ionxOwner)).transfer(deployer, parseEther('100')).then(tx => tx.wait());

  } else {
    const { deployer } = await getNamedAccounts();
    ionx = await ethers.getContract('Ionx', await ethers.getSigner(deployer));
    // ionx = await ethers.getContractAt('Ionx', addressBook[chainId].ionx, await ethers.getSigner(deployer));
    // fund signer
    const ionxOwner = await ionx.owner();
    await ionx.connect(await ethers.getSigner(ionxOwner)).transfer(deployer, parseEther('100000')).then(tx => tx.wait());
    ionx = await ethers.getContract('Ionx', await ethers.getSigner(deployer));
  }

  // const ionxAddress = await ionx.getAddress();
  const universe: UniverseRP = await ethers.getContract('UniverseRP');

  // Register & Fund Reward Programs for each Staking Token
  for (let i = 0; i < addressBook[chainId].stakingTokens.length; i++) {
    const stakingToken = addressBook[chainId].stakingTokens[i];
    const rewardProgram: RewardProgram = await ethers.getContract(`RewardProgram${stakingToken.id}`);
    const rewardProgramAddress = await rewardProgram.getAddress();

    // verify reward program
    if (!isTestnet() && !isHardhat()) {
      await verifyContract(`RewardProgram${stakingToken.id}`, rewardProgram);
    }

    // fund reward program
    const { deployer } = await getNamedAccounts();
    await ionx.connect(await ethers.getSigner(deployer)).approve(rewardProgramAddress, ethers.parseEther(stakingToken.funding)).then(tx => tx.wait());
    await rewardProgram.connect(await ethers.getSigner(deployer)).fundProgram(1).then(tx => tx.wait());

    // register reward program in universe
    console.log(`    -- Registering RewardProgram in the Universe...`);
    await universe.setRewardProgram(rewardProgramAddress, stakingToken.address);

    console.log(`    -- RewardProgram for ${stakingToken.id} is registered!`);
  }
};

export default RewardProgramDeploy;

RewardProgramDeploy.dependencies = ['RewardPrograms'];
RewardProgramDeploy.tags = ['RPDeploy'];
