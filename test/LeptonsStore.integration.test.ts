import { expect } from "chai";
import { ethers, getNamedAccounts, deployments } from 'hardhat';
import { Ionx, Lepton2, LeptonsStore } from "../typechain-types";
import { DEAD_ADDRESS } from "../utils/globals";
import { LeptonType, leptonConfig } from "../deploy/Lepton2";
import { isTestnet } from "../utils/isTestnet";

import { signERC2612Permit }  from "eth-permit";
import { parseEther } from "ethers";

describe('Leptons Store Integration', async () => {
  let leptonStore: LeptonsStore;
  let ionx: Ionx;
  let lepton: Lepton2;

  let deployer: string;
  let leptonStoreAddress: string;
  let ionxAddress: string;// = '0x02D3A27Ac3f55d5D91Fb0f52759842696a864217';
  let leptonAddress: string;// = '0x3Cd2410EAa9c2dCE50aF6CCAb72Dc93879a09c1F';

  beforeEach(async () => {
    await deployments.fixture(['Ionx', 'Lepton2', 'LeptonsStore']);

    leptonStore = await ethers.getContract('LeptonsStore');
    lepton = await ethers.getContract('Lepton2');
    ionx = await ethers.getContract('Ionx');

    leptonStoreAddress =  await leptonStore.getAddress();
    ionxAddress =  await ionx.getAddress();
    leptonAddress =  await lepton.getAddress();
  });

  before(async () => {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    deployer = deployerAccount;
  });

  it ('Loads leptons', async() => {
    // mock lepton deployer
    const leptonOwnerAddress = await lepton.owner();
    const owner = await ethers.getImpersonatedSigner(leptonOwnerAddress);

    // give eth to owner
    const deployerSigner = await ethers.getSigner(deployer);
    deployerSigner.sendTransaction({to: leptonOwnerAddress, value: parseEther('100')}).then(tx => tx.wait());

    // set minting free 0
    const leptonKey = await lepton.getNextType();
    const amountToBuy = 10n;
    const chainType = isTestnet() ? 'test' : 'live';

    const leptonType: LeptonType = leptonConfig.types[Number(leptonKey)];
    const leptonConnectedOwner = lepton.connect(owner) as Lepton2;

    await leptonConnectedOwner.updateLeptonType(
      leptonKey,
      leptonType.tokenUri,
      0n,
      leptonType.supply[chainType],
      leptonType.multiplier,
      leptonType.bonus,
    );

    const price = await lepton.getNextPrice();
    expect(price).to.be.eq(0);

    const tokenIdFromBatchStart = Number(await lepton.totalSupply()) + 1;

    //load
    await leptonStore.setNextTokenId(0); // 0 = load tokenId from Lepton Contract (totalSupply)
    await leptonStore.load(amountToBuy, { value: price });

    for (let i = tokenIdFromBatchStart; i <= amountToBuy; i++){
      expect(await lepton.ownerOf(i)).to.be.eq(leptonStoreAddress);
    }

    await leptonConnectedOwner.updateLeptonType(
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

});