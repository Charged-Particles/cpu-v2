import { ethers } from 'hardhat';
import { Ionx, Lepton2, LeptonsStore } from "../typechain-types";
import { LeptonType, leptonConfig } from "../deploy/Lepton2";
import { isTestnet } from "../utils/isTestnet";

async function main() {
  const leptonStore = await ethers.getContract<LeptonsStore>('LeptonsStore');
  const lepton = await ethers.getContract<Lepton2>('Lepton2');
  const ionx = await ethers.getContract<Ionx>('Ionx');
  
  const leptonStoreAddress =  await leptonStore.getAddress();
  const ionxAddress = await ionx.getAddress(); 

  // set minting free 0
  const leptonKey = await lepton.getNextType();
  const amountToBuy = 3n; 
  const chainType = isTestnet() ? 'test' : 'live';

  const leptonType: LeptonType = leptonConfig.types[Number(leptonKey)];

  await lepton.updateLeptonType(
    leptonKey,
    leptonType.tokenUri,
    0n,
    leptonType.supply[chainType],
    leptonType.multiplier,
    leptonType.bonus,
  ).then(tx => tx.wait());

  const price = await lepton.getNextPrice();

  if (Number(price) > 0) {
    throw new Error('Leptons price not set to zero.');
  }

  console.log(`Lepton ${leptonKey} price set to 0`);

  //load
  const tokenIdFromBatchStart = Number(await lepton.totalSupply()) + 1;

  console.log(`Loading from from ID${tokenIdFromBatchStart} up to token ${tokenIdFromBatchStart + Number(amountToBuy)}`);

  await leptonStore.load(amountToBuy, { value: price });

  await lepton.updateLeptonType(
    leptonKey,
    leptonType.tokenUri,
    leptonType.price[chainType],
    leptonType.supply[chainType],
    leptonType.multiplier,
    leptonType.bonus,
  ).then(tx => tx.wait());

  const priceAfterReset = await lepton.getNextPrice();
  
  console.log(`Lepton ${leptonKey} price set to  ${leptonType.price[chainType]}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});