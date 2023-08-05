import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { Lepton2 } from "../typechain-types";
import { leptonConfig } from "../deploy/Lepton2";

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
});