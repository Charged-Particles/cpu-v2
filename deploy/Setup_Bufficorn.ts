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
    await chargedParticles.createCustomImplementation(bufficornAddress, bufficornAddress),
    ' - Custom Implementation Created'
  );

  // Mint a bunch of Bufficorn NFTs
  console.log(`Minting 10 Bufficorn NFTs...`);
  for (let i = 0; i < 10; i++) {
    await performTx(await bufficorn.mint(), ` - Minted Bufficorn NFT with Token ID {id}...`);
  }

  // Mint a bunch of Bufficorn Trait NFTs
  const traits = ['Hat', 'Gauntlet', 'Sunglasses', 'Sword', 'Crazy-Eye'];
  let traitBit = 1;
  for (let i = 0; i < traits.length; i++) {
    console.log(`Minting 10 Bufficorn ${traits[i]} Trait-NFTs...`);

    for (let j = 0; j < 10; j++) {
      await performTx(await bufficorn.mintWithTraits(traitBit), ` - Minted ${traits[i]} Trait-NFT with TokenID {id}...`);
    }

    // Next Trait Bit
    traitBit = traitBit << 1;
  }
};
export default Setup_Bufficorn;

Setup_Bufficorn.dependencies = ['ChargedParticles', 'BufficornZK'];
Setup_Bufficorn.tags = ['Setup_Bufficorn'];