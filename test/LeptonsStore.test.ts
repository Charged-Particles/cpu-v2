import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { Ionx, Lepton2, LeptonsStore } from "../typechain-types";
import { DEAD_ADDRESS } from "../utils/globals";
import { LeptonType, leptonConfig } from "../deploy/Lepton2";
import { isTestnet } from "../utils/isTestnet";

describe('Ionx deployment', async () => {
  let leptonStore: LeptonsStore;
  let lepton: Lepton2;
  let deployer: string;
  let leptonStoreAddress: string;

  beforeEach(async () => {
    await deployments.fixture(['Lepton2', 'LeptonsStore']);
    
    leptonStore = await ethers.getContract('LeptonsStore');
    lepton = await ethers.getContract('Lepton2');
    
    leptonStoreAddress =  await leptonStore.getAddress();
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

  it ('Loads: Batch mints payed leptons', async () => {
    const amountToBuy = 10n;
    const singleMintCost = await lepton.getNextPrice();
    const mintCost = amountToBuy * singleMintCost;

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

    await leptonStore.load(amountToBuy, { value: price });

    for (let i = 1; i <= amountToBuy; i++){
      expect(await lepton.ownerOf(i)).to.be.eq(leptonStoreAddress);
    }
  });

});