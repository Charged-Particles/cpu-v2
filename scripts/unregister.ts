import { ethers } from 'hardhat';
import { UniverseRP } from "../typechain-types";

async function main() {

  const universe: UniverseRP = await ethers.getContract('UniverseRP');
  await universe.removeRewardProgram('0xdAC17F958D2ee523a2206206994597C13D831ec7'); // ETH-USDT
  console.log('USDT Reward Program Removed!');

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
