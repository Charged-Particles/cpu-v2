import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { Lepton2 } from "../typechain-types";
import { LeptonType, leptonConfig } from "../deploy/Lepton2";
import { isTestnet } from "../utils/isTestnet";

describe('Lepton2 deployment', async () => {
  let lepton: Lepton2;
  let deployer: string;

  beforeEach(async () => {
    await deployments.fixture(['Lepton2']);
    lepton = await ethers.getContract('Lepton2');
  });

  before(async () => {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    deployer = deployerAccount;
  });

  it('Single mints', async () => {
    const price = await lepton.getNextPrice();
    await lepton.mintLepton({ value: price }).then(tx => tx.wait());
    expect(await lepton.balanceOf(deployer)).to.be.eq(1);

    const multiplier = await lepton.getMultiplier(1);
    const bonus = await lepton.getBonus(1);
    const tokenURI = await lepton.tokenURI(1);

    expect(multiplier).to.be.eq(leptonConfig.types[0].multiplier);
    expect(bonus).to.be.eq(leptonConfig.types[0].bonus);
    expect(tokenURI).to.be.eq(leptonConfig.types[0].tokenUri);
  });

  it ('Mints a batch', async () => {
    const price = await lepton.getNextPrice();
    await lepton.batchMintLepton(20, { value: price * 20n })

    expect(await lepton.balanceOf(deployer)).to.be.eq(20);
    await lepton.batchMintLepton(20, { value: price * 20n })
    expect(await lepton.balanceOf(deployer)).to.be.eq(40);
  });


  it ('Distributes free leptons', async () => {
    await lepton.setMaxMintPerTx(1000000n).then(tx => tx.wait());

    // updateLeptonType set all leptons mint price to 0
    const chainType = isTestnet() ? 'test' : 'live';

    let mintCount = 0n;

    for (const leptonKey in leptonConfig.types) {
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
      await lepton.batchMintLepton(leptonType.supply[chainType], { value: 0n  }).then(tx => tx.wait());
      
      mintCount = leptonType.supply[chainType] + mintCount;

      console.log(await lepton.balanceOf(deployer));
      expect(await lepton.balanceOf(deployer)).to.be.eq(mintCount); 
    }

  });
});

function toWei(arg0: string) {
  throw new Error("Function not implemented.");
}
