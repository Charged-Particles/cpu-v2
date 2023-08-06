import { ethers, getNamedAccounts } from "hardhat";
import { Lepton2, RewardProgram, Universe } from "../typechain-types";

async function main() {
  const assetAddress = '0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F';
  const setBaseMultiplier = '1000A';
  
  const lepton: Lepton2 = await ethers.getContract('Lepton2');
  const leptonAddress =  await lepton.getAddress();
  const universe: Universe = await ethers.getContract('UniverseRP');
  const rewardProgram : RewardProgram = await ethers.getContract('RewardProgram');

  await universe.setRewardProgram(await rewardProgram.getAddress(), dai, leptonAddress).then(tx => tx.wait());
  await rewardProgram.setBaseMultiplier(assetAddress , setBaseMultiplier).then(tx => tx.wait());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});