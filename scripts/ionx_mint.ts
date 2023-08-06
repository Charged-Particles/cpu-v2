import { ethers, getNamedAccounts } from "hardhat";
import { Ionx } from "../typechain-types";

async function main() {
  const testAccount = '0x6d46b37708dA7Ed4E5C4509495768Fecd3D17C01';
  const ionx: Ionx = await ethers.getContract('Ionx');

  const transaction = await ionx.transfer(testAccount, ethers.parseEther('1000000')).then(tx => tx.wait());
  console.log(transaction);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});