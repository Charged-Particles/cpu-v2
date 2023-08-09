import { ethers, getNamedAccounts } from "hardhat";
import { Lepton2, RewardProgram, UniverseRP } from "../typechain-types";

async function main() {
  const dai = '0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F';
  const setBaseMultiplier = '1000';
  
  const lepton: Lepton2 = await ethers.getContract('Lepton2');
  const leptonAddress =  await lepton.getAddress();
  const universe: UniverseRP = await ethers.getContract('UniverseRP');
  const rewardProgram : RewardProgram = await ethers.getContract('RewardProgram');

  // TODO
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});