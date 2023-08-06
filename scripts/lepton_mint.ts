import { ethers, getNamedAccounts } from "hardhat";
import { Lepton2 } from "../typechain-types";

async function main() {
  const testAccount = '0x277BFc4a8dc79a9F194AD4a83468484046FAFD3A';

  const { deployer } = await getNamedAccounts();
  const lepton: Lepton2 = await ethers.getContract('Lepton2');
  // const price = await lepton.getNextPrice();
  // const mintTx = await lepton.batchMintLepton(10, { value: price * 10n }).then(tx => tx.wait());


  await lepton.transferFrom(deployer, testAccount, 10).then(tx => tx.wait());


}

main().catch((error) => {  console.error(error);
  process.exitCode = 1;
});