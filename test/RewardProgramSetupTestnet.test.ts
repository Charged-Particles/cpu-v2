import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { getChargedParticlesOwner } from "../utils/getSigners";
import { ChargedParticles, ChargedSettings, Lepton2 } from "../typechain-types";
import { addressBook } from "../utils/globals";
import { Signer } from "ethers";

describe('RewardProgramSetupTestnet deployments', async () => {
  let chargedParticles: ChargedParticles, chargedSettings: ChargedSettings;
  let lepton: Lepton2;

  let deployer: string, user: string, chargedOwner: Signer;
  let leptonAddress: string, chargedParticlesAddress: string;
  let chainId;

  before(async () => {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    chargedOwner = await getChargedParticlesOwner();
    deployer = deployerAccount;
    user = user1;
  });

  before(async () => {
    await deployments.fixture(['RPSetupTest']);

    chainId = network.config.chainId ?? 1;
    lepton = await ethers.getContract('Lepton2');
    chargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles, chargedOwner);
    chargedSettings = await ethers.getContractAt('ChargedSettings', addressBook[chainId].chargedSettings, chargedOwner);

    leptonAddress = await lepton.getAddress();
    chargedParticlesAddress = await chargedParticles.getAddress();

    chargedSettings.enableNftContracts([ leptonAddress ]).then(tx => tx.wait());
  });

  it ('Bonds', async () => {
    await lepton.mintLepton({ value: ethers.parseEther('0.3') }).then(tx => tx.wait());
    await lepton.mintLepton({ value: ethers.parseEther('0.3') }).then(tx => tx.wait());
    expect(await lepton.balanceOf(deployer)).to.be.eq(2);

    await lepton.approve(chargedParticlesAddress, 2).then(tx => tx.wait());

    await chargedParticles.connect(await ethers.getSigner(deployer)).covalentBond(
      leptonAddress,
      1,
      'generic.B',
      leptonAddress,
      2,
      1
    ).then(tx => tx.wait());
  });

  it ('Energizes ', async () => {
    
  });
  
});