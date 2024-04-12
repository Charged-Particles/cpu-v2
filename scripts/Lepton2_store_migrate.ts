import { ethers } from 'hardhat';
import { Ionx, Lepton2, LeptonsStore } from "../typechain-types";

async function main() {
  let ionx: Ionx;
  let lepton: Lepton2;
  let leptonsStore1: LeptonsStore;
  let leptonsStore2: LeptonsStore;
  let leptonsStore3: LeptonsStore;

  // Ethereum Mainnet
  leptonsStore1 = await ethers.getContractAt('LeptonsStore', '0xbD2b4C929D4D05e74B306d88f7A9ce8920d245E3'); // starting at Token ID # 1135
  leptonsStore2 = await ethers.getContractAt('LeptonsStore', '0xD5dE6F1c1cb796C63a039EF68451f285Be60Bc74'); // starting at Token ID # 1139 to 1186
  leptonsStore3 = await ethers.getContractAt('LeptonsStore', '0x7Bf70a3DC2d5Da7c924ce3E414E14C4564A59b1b');

  lepton = await ethers.getContractAt('Lepton2', '0x3Cd2410EAa9c2dCE50aF6CCAb72Dc93879a09c1F');
  ionx = await ethers.getContractAt('Ionx', '0x02D3A27Ac3f55d5D91Fb0f52759842696a864217');

  const leptonStoreAddress1 =  await leptonsStore1.getAddress();
  const leptonStoreAddress2 =  await leptonsStore2.getAddress();
  const leptonStoreAddress3 =  await leptonsStore3.getAddress();
  const leptonAddress = await lepton.getAddress();
  const ionxAddress = await ionx.getAddress();

  console.log('Loading LeptonsStore with:');
  console.log(`Lepton Address: "${leptonAddress}"`);
  console.log(`IONX Address: "${ionxAddress}"`);
  console.log(`Lepton Store Address 1: "${leptonStoreAddress1}"`);
  console.log(`Lepton Store Address 2: "${leptonStoreAddress2}"`);
  console.log(`Lepton Store Address 3: "${leptonStoreAddress3}"`);


  // Move Leptons from
  //  First Store:
  // for (let i = 1135; i < 1139; i++) {
  //   console.log(`Withdrawing from Lepton Store 1; Token ID ${i}`);
  //   await leptonsStore1.withdrawERC721(leptonStoreAddress3, leptonAddress, i).then(tx => tx.wait());
  // }

  //  Second Store:
  for (let i = 1161; i < 1187; i++) {
    console.log(`Withdrawing from Lepton Store 2; Token ID ${i}`);
    await leptonsStore2.withdrawERC721(leptonStoreAddress3, leptonAddress, i).then(tx => tx.wait());
  }

  // Set Starting Token ID
  console.log(`Setting Starting Token ID to 1135`);
  await leptonsStore3.setNextTokenId(1135).then(tx => tx.wait()); // 0 = load tokenId from Lepton Contract (totalSupply)

  console.log('Complete!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});