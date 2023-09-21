import { ethers } from "hardhat";
import { UniverseRP } from "../typechain-types";

async function main() {
  const multiplierContract = '0x71758a4822b0e7b5c21ef8f73c69e528be4882c7';
  const universe: UniverseRP = await ethers.getContract('UniverseRPPolygon');

  console.log('... setting new multiplier');
  await universe.setMultiplierNft(multiplierContract).then(tx => tx.wait());
  console.log('new address set');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});