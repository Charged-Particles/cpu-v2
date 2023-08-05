import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { getChargedParticlesOwner } from "../utils/getSigners";
import { ChargedParticles, ChargedSettings, Ionx, Lepton2, RewardProgram } from "../typechain-types";
import { addressBook } from "../utils/globals";
import { Signer } from "ethers";

describe('RewardProgramSetupTestnet deployments', async () => {
  let chargedParticles: ChargedParticles, chargedSettings: ChargedSettings, rewardProgram: RewardProgram;
  let lepton: Lepton2, ionx: Ionx;

  let deployer: string, user: string, chargedOwner: Signer;
  let leptonAddress: string, chargedParticlesAddress: string, ionxAddress: string;
  let chainId;

  before(async () => {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    chargedOwner = await getChargedParticlesOwner();
    deployer = deployerAccount;
    user = user1;
  });

  beforeEach(async () => {
    await deployments.fixture(['RPSetupTest']);

    chainId = network.config.chainId ?? 1;
    lepton = await ethers.getContract('Lepton2');
    ionx = await ethers.getContract('Ionx');
    rewardProgram = await ethers.getContract('RewardProgram');
    chargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles, chargedOwner);
    chargedSettings = await ethers.getContractAt('ChargedSettings', addressBook[chainId].chargedSettings, chargedOwner);

    leptonAddress = await lepton.getAddress();
    ionxAddress = await ionx.getAddress();
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
    await lepton.mintLepton({ value: ethers.parseEther('0.3') }).then(tx => tx.wait());
    await lepton.mintLepton({ value: ethers.parseEther('0.3') }).then(tx => tx.wait());
    expect(await lepton.balanceOf(deployer)).to.be.eq(2);

    const amountDeposit = ethers.parseEther('1');
    await lepton.approve(chargedParticlesAddress, 2).then(tx => tx.wait());

    await ionx.approve(chargedParticlesAddress, amountDeposit).then(tx => tx.wait());

    await expect(chargedParticles.connect(await ethers.getSigner(deployer)).energizeParticle(
      leptonAddress,
      1,
      'generic.B',
      ionxAddress,
      amountDeposit,
      '0x0000000000000000000000000000000000000000'
    )).to.emit(rewardProgram, 'AssetDeposit')
      .withArgs(leptonAddress, 1, 'generic.B', amountDeposit);

    await expect(chargedParticles.connect(await ethers.getSigner(deployer)).covalentBond(
      leptonAddress,
      1,
      'generic.B',
      leptonAddress,
      2,
      1
    )).to.emit(rewardProgram, 'NftDeposit');
    
  });
  
});