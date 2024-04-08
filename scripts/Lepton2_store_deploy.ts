import { ethers } from 'hardhat';
import { Ionx, Lepton2, LeptonsStore } from "../typechain-types";
import { LeptonType, leptonConfig } from "../deploy/Lepton2";
import { isTestnet } from "../utils/isTestnet";
import { isHardhat } from '../utils/isHardhat';

async function main() {
	let ionx: Ionx;
  let lepton: Lepton2;
  let leptonsStore: LeptonsStore;

	if (isTestnet() || isHardhat()) {
    leptonsStore = await ethers.getContract<LeptonsStore>('LeptonsStore');
    lepton = await ethers.getContract<Lepton2>('Lepton2');
    ionx = await ethers.getContract<Ionx>('Ionx');
	} else {
    // Ethereum Mainnet
		leptonsStore = await ethers.getContractAt('LeptonsStore', '0xbD2b4C929D4D05e74B306d88f7A9ce8920d245E3');
		lepton = await ethers.getContractAt('Lepton2', '0x3Cd2410EAa9c2dCE50aF6CCAb72Dc93879a09c1F');
		ionx = await ethers.getContractAt('Ionx', '0x02D3A27Ac3f55d5D91Fb0f52759842696a864217');
	}

  const leptonStoreAddress =  await leptonsStore.getAddress();
  const leptonAddress = await lepton.getAddress();
  const ionxAddress = await ionx.getAddress();

  console.log('Loading LeptonsStore with:');
  console.log(`Lepton Address: "${leptonAddress}"`);
  console.log(`IONX Address: "${ionxAddress}"`);
  console.log(`Lepton Store Address: "${leptonStoreAddress}"`);

  // set minting free 0
  const leptonKey = await lepton.getNextType();
  const amountToBuy = 5n;
  const chainType = isTestnet() ? 'test' : 'live';

  // Set Price of Leptons to Zero
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

  // Load the Store with Leptons
  const tokenIdFromBatchStart = Number(await lepton.totalSupply()) + 1;
  console.log(`Loading from from ID ${tokenIdFromBatchStart} up to token ${tokenIdFromBatchStart + Number(amountToBuy)}`);

  await leptonsStore.load(amountToBuy, { value: price });

  // Reset Price of Leptons
  await lepton.updateLeptonType(
    leptonKey,
    leptonType.tokenUri,
    leptonType.price[chainType],
    leptonType.supply[chainType],
    leptonType.multiplier,
    leptonType.bonus,
  ).then(tx => tx.wait());

  const priceAfterReset = await lepton.getNextPrice();
  console.log(`Lepton ${leptonKey} price set to  ${priceAfterReset}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});