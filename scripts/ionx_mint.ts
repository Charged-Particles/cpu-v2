import { ethers, getNamedAccounts } from "hardhat";
import { Ionx } from "../typechain-types";

async function main() {
  const testAccount = '0x48F54e595bf039CF30fa5F768c0b57EAC6508a06';
  const ionx: Ionx = await ethers.getContract('Ionx');

  const transaction = await ionx.transfer(testAccount, ethers.parseEther('1000000')).then(tx => tx.wait());
  console.log(transaction);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});