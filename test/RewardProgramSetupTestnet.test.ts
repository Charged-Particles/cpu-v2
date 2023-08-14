import { expect } from "chai";
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { getChargedParticlesOwner } from "../utils/getSigners";
import { UniverseRP, ChargedParticles, ChargedSettings, Ionx, Lepton2, RewardProgram, TokenInfoProxy, IERC20Detailed } from "../typechain-types";
import { addressBook } from "../utils/globals";
import { Signer } from "ethers";

describe('RewardProgramSetupTestnet deployments', async () => {
  let chargedParticles: ChargedParticles, chargedSettings: ChargedSettings, rewardProgram: RewardProgram, tokenInfoProxy: TokenInfoProxy;
  let lepton: Lepton2, ionx: Ionx, universe: UniverseRP, dai: IERC20Detailed;
  let iface, fragment;

  let deployer: string, user: string, chargedOwner: Signer;
  let leptonAddress: string, chargedParticlesAddress: string, ionxAddress: string, universeAddress: string;
  let chainId;

  before(async () => {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    chargedOwner = await getChargedParticlesOwner();
    deployer = deployerAccount;
    user = user1;
  });

  beforeEach(async () => {
    await deployments.fixture(['RPSetupTest']);

    chainId = network.config.chainId ?? 80001;
    lepton = await ethers.getContract('Lepton2');
    ionx = await ethers.getContract('Ionx');
    dai = await ethers.getContractAt('IERC20Detailed', addressBook[chainId].dai);
    rewardProgram = await ethers.getContract('RewardProgramDAI');
    universe = await ethers.getContract('UniverseRP');
    chargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles, chargedOwner);
    chargedSettings = await ethers.getContractAt('ChargedSettings', addressBook[chainId].chargedSettings, chargedOwner);
    tokenInfoProxy = await ethers.getContractAt('TokenInfoProxy', addressBook[chainId].tokenInfoProxy, chargedOwner);

    universeAddress = await universe.getAddress();
    leptonAddress = await lepton.getAddress();
    ionxAddress = await ionx.getAddress();
    chargedParticlesAddress = await chargedParticles.getAddress();

    chargedSettings.enableNftContracts([ leptonAddress ]).then(tx => tx.wait());

    iface = new ethers.Interface([ 'function ownerOf(uint256)' ]);
    fragment = iface.getFunction('ownerOf');
    if (fragment !== null) {
      tokenInfoProxy.setContractFnCreatorOf(leptonAddress, fragment.selector);
    }
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
    await lepton.approve(chargedParticlesAddress, 2).then(tx => tx.wait());

    const amountDeposit = ethers.parseEther('.1');

    await dai.approve(chargedParticlesAddress, amountDeposit).then(tx => tx.wait());

    await expect(chargedParticles.connect(await ethers.getSigner(deployer)).energizeParticle(
      leptonAddress,
      1,
      'generic.B',
      await dai.getAddress(),
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
    )).to.emit(universe, 'NftDeposit');

    const uuid = ethers.solidityPackedKeccak256([ 'address', 'uint256' ], [leptonAddress, 1]);
    const gatherGrowthSimulated = await rewardProgram.calculateRewardsEarned(uuid, 100n);
    expect(gatherGrowthSimulated).to.be.greaterThan(0);
  });
});