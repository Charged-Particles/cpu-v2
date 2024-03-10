import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { Ionx, LeptonsStore } from "../typechain-types";
import { DEAD_ADDRESS } from "../utils/globals";

describe('Ionx deployment', async () => {
  let leptonStore: LeptonsStore;
  let deployer: string;

  beforeEach(async () => {
    await deployments.fixture(['Lepton2', 'LeptonsStore']);
    leptonStore = await ethers.getContract('LeptonsStore');
  });

  before(async () => {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    deployer = deployerAccount;
  });

  it ('Holds lepton address in contract state', async () => {
    const lepton = await ethers.getContract('Lepton2');
    const leptonAddress = await lepton.getAddress();

    expect(await leptonStore.lepton()).to.be.eq(leptonAddress);
  });

  it ('Changes leptons contract address', async () => {
    await leptonStore.setLepton(DEAD_ADDRESS);

    expect(await leptonStore.lepton()).to.be.eq(DEAD_ADDRESS);
  });

});