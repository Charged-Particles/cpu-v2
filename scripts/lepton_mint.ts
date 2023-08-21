import { ethers, getNamedAccounts } from "hardhat";
import { Lepton2 } from "../typechain-types";

async function main() {
  const testAccount = '0x277BFc4a8dc79a9F194AD4a83468484046FAFD3A';

  const { deployer } = await getNamedAccounts();
  const lepton: Lepton2 = await ethers.getContract('Lepton2');
  // const price = await lepton.getNextPrice();
  // const mintTx = await lepton.batchMintLepton(10, { value: price * 10n }).then(tx => tx.wait());


  await lepton.transferFrom(deployer, testAccount, 11).then(tx => tx.wait());
  await lepton.transferFrom(deployer, testAccount, 12).then(tx => tx.wait());
  await lepton.transferFrom(deployer, testAccount, 13).then(tx => tx.wait());
  await lepton.transferFrom(deployer, testAccount, 14).then(tx => tx.wait());
  await lepton.transferFrom(deployer, testAccount, 15).then(tx => tx.wait());
  await lepton.transferFrom(deployer, testAccount, 16).then(tx => tx.wait());
  await lepton.transferFrom(deployer, testAccount, 17).then(tx => tx.wait());
  await lepton.transferFrom(deployer, testAccount, 18).then(tx => tx.wait());
  await lepton.transferFrom(deployer, testAccount, 19).then(tx => tx.wait());
}

main().catch((error) => {  console.error(error);
  process.exitCode = 1;
});