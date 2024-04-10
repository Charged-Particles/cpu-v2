import { expect } from "chai";
import { ethers, getNamedAccounts, deployments } from 'hardhat';
import { Ionx, Lepton2, LeptonsStore } from "../typechain-types";
import { DEAD_ADDRESS } from "../utils/globals";
import { LeptonType, leptonConfig } from "../deploy/Lepton2";
import { isTestnet } from "../utils/isTestnet";

import { signERC2612Permit }  from "eth-permit";

describe('Leptons Store', async () => {
  let leptonStore: LeptonsStore;
  let lepton: Lepton2;
  let ionx: Ionx;

  let deployer: string;
  let leptonStoreAddress: string;
  let ionxAddress: string;

  beforeEach(async () => {
    await deployments.fixture(['Ionx', 'Lepton2', 'LeptonsStore']);

    leptonStore = await ethers.getContract('LeptonsStore');
    lepton = await ethers.getContract('Lepton2');
    ionx = await ethers.getContract('Ionx');

    leptonStoreAddress =  await leptonStore.getAddress();
    ionxAddress = await ionx.getAddress();
  });

  before(async () => {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    deployer = deployerAccount;
  });

  it ('Holds lepton address in contract state', async () => {
    const leptonAddress = await lepton.getAddress();
    expect(await leptonStore.lepton()).to.be.eq(leptonAddress);

  });

  it ('Changes leptons contract address', async () => {
    await leptonStore.setLepton(DEAD_ADDRESS);
    expect(await leptonStore.lepton()).to.be.eq(DEAD_ADDRESS);
  });

  it ('Loads: Batch mints paid leptons', async () => {
    const amountToBuy = 10n;
    const singleMintCost = await lepton.getNextPrice();
    const mintCost = amountToBuy * singleMintCost;

    await leptonStore.setNextTokenId(0); // 0 = load tokenId from Lepton Contract (totalSupply)
    await leptonStore.load(amountToBuy, { value: mintCost });

    for (let i = 1; i <= amountToBuy; i++){
      expect(await lepton.ownerOf(i)).to.be.eq(leptonStoreAddress);
    }
  });

  it ('Loads: Batch mint free leptons', async () => {
    const leptonKey = 0;
    const amountToBuy = 10n;
    const chainType = isTestnet() ? 'test' : 'live';

    const leptonType: LeptonType = leptonConfig.types[leptonKey];

    await lepton.updateLeptonType(
      leptonKey,
      leptonType.tokenUri,
      0n,
      leptonType.supply[chainType],
      leptonType.multiplier,
      leptonType.bonus,
    );

    const price = await lepton.getNextPrice();
    expect(price).to.be.eq(0);

    await leptonStore.setNextTokenId(0); // 0 = load tokenId from Lepton Contract (totalSupply)
    await leptonStore.load(amountToBuy, { value: price });

    for (let i = 1; i <= amountToBuy; i++){
      expect(await lepton.ownerOf(i)).to.be.eq(leptonStoreAddress);
    }

    await lepton.updateLeptonType(
      leptonKey,
      leptonType.tokenUri,
      leptonType.price[chainType],
      leptonType.supply[chainType],
      leptonType.multiplier,
      leptonType.bonus,
    );

    const priceAfterReset = await lepton.getNextPrice();

    expect(priceAfterReset).to.be.eq(leptonType.price[chainType]);
  });

  it ('IONX Permit, increases allowance', async () => {

    const signer = await ethers.getSigner(deployer);
    const allowance = 10000000n;

    const result = await signERC2612Permit(
      signer,
      ionxAddress,
      deployer,
      leptonStoreAddress,
      10000000
    );

    const storeAllowanceBeforePermit = await ionx.allowance(deployer, leptonStoreAddress);

    expect(storeAllowanceBeforePermit).to.be.eq(0);

    await ionx.permit(deployer, leptonStoreAddress, 10000000, result.deadline, result.v, result.r, result.s).then(tx => tx.wait());

    const storeAllowancePermit = await ionx.allowance(deployer, leptonStoreAddress);
    expect(allowance).to.be.eq(storeAllowancePermit);
  });

  it ('Purchase lepton with ionx', async () => {
    // Fund
    const leptonKey = 0;
    const amountToBuy = 10n;
    const chainType = isTestnet() ? 'test' : 'live';

    const leptonType: LeptonType = leptonConfig.types[leptonKey];

    await lepton.updateLeptonType(
      leptonKey,
      leptonType.tokenUri,
      0n,
      leptonType.supply[chainType],
      leptonType.multiplier,
      leptonType.bonus,
    );

    await leptonStore.setNextTokenId(0); // 0 = load tokenId from Lepton Contract (totalSupply)
    await leptonStore.load(amountToBuy, { value: 0n });

    // permit
    const signer = await ethers.getSigner(deployer);

    const result = await signERC2612Permit(
      signer,
      ionxAddress,
      deployer,
      leptonStoreAddress,
      1 // price of lepton in IONX (see leptonPrice in deploy/LeptonsStore.ts)
    );

    await leptonStore.buyWithIonx(
      1,
      result.deadline,
      result.v,
      result.r,
      result.s
    ).then(tx => tx.wait());

    expect(await lepton.ownerOf(1)).to.be.eq(deployer);
  });

  it ('Purchase multiple lepton with ionx', async () => {
    // Fund
    const leptonKey = 0;
    const amountToLoad = 10n;
    const amountToBuy = 4;
    const costOfLepton = 1; // price of lepton in IONX (see leptonPrice in deploy/LeptonsStore.ts)
    const chainType = isTestnet() ? 'test' : 'live';

    const leptonType: LeptonType = leptonConfig.types[leptonKey];

    await lepton.updateLeptonType(
      leptonKey,
      leptonType.tokenUri,
      0n,
      leptonType.supply[chainType],
      leptonType.multiplier,
      leptonType.bonus,
    );

    await leptonStore.setNextTokenId(0); // 0 = load tokenId from Lepton Contract (totalSupply)
    await leptonStore.load(amountToLoad, { value: 0n });

    // permit
    const signer = await ethers.getSigner(deployer);

    const signature1 = await signERC2612Permit(
      signer,
      ionxAddress,
      deployer,
      leptonStoreAddress,
      costOfLepton * amountToBuy
    );

    await leptonStore.buyWithIonx(
      amountToBuy,
      signature1.deadline,
      signature1.v,
      signature1.r,
      signature1.s
    ).then(tx => tx.wait());


    for (let i = 1; i <= amountToBuy; i++){
      expect(await lepton.ownerOf(i)).to.be.eq(deployer);
    }

    const signature2 = await signERC2612Permit(
      signer,
      ionxAddress,
      deployer,
      leptonStoreAddress,
      costOfLepton * amountToBuy
    );

    await leptonStore.buyWithIonx(
      amountToBuy,
      signature2.deadline,
      signature2.v,
      signature2.r,
      signature2.s
    ).then(tx => tx.wait());

    for (let i = 5; i <= amountToBuy; i++){
      expect(await lepton.ownerOf(i)).to.be.eq(deployer);
    }
  });
});