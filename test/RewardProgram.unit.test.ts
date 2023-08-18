import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { getChargedParticlesOwner } from "../utils/getSigners";
import { UniverseRP, ChargedParticles, ChargedSettings, Ionx, Lepton2, RewardProgram, TokenInfoProxy, IERC20Detailed } from "../typechain-types";
import { addressBook } from "../utils/globals";
import { Signer } from "ethers";

describe('Unit test for reward program', () => {
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

    chainId = network.config.chainId ?? 1;
    dai = await ethers.getContractAt('IERC20Detailed', addressBook[chainId].dai);
    ionx = await ethers.getContractAt('Ionx', addressBook[chainId].ionx);
    lepton = await ethers.getContractAt('Lepton2', addressBook[chainId].lepton);
    universe = await ethers.getContract('UniverseRP');
    rewardProgram = await ethers.getContract('RewardProgramDAI');

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

  const leptonDepositCases = [
    {
      description: 'Lepton deposit length 4',
      leptonDepositMultipliers: [120, 130, 140, 150],
      expectedTotalMultiplier: '270'
    },
    // {
    //   description: 'Lepton deposit length 5',
    //   leptonDepositMultipliers: [120, 130, 140, 150, 160],
    //   expectedTotalMultiplier: '290'
    // },
    // {
    //   description: 'Lepton deposit length 6',
    //   leptonDepositMultipliers: [120, 130, 140, 150, 160, 170],
    //   expectedTotalMultiplier: '1000'
    // },
    // {
    //   description: 'Lepton deposit length 6',
    //   leptonDepositMultipliers: [120, 130, 140, 150, 160, 170],
    //   expectedTotalMultiplier: '1000'
    // }
  ];

  for (let i = 0; i < leptonDepositCases.length; i++) {
    it(`${leptonDepositCases[i].description}`, async () => {
      await lepton.mintLepton({ value: ethers.parseEther('0.3') }).then(tx => tx.wait());
      await lepton.mintLepton({ value: ethers.parseEther('0.3') }).then(tx => tx.wait());
      // await lepton.approve(chargedParticlesAddress, 2).then(tx => tx.wait());
  
      // const amountDeposit = ethers.parseEther('.1');
      // await dai.approve(chargedParticlesAddress, amountDeposit).then(tx => tx.wait());

      // const leptonMultipliers = leptonDepositCases[i]?.leptonDepositMultipliers;
      // const contractAddress = '0x5d183d790d6b570eaec299be432f0a13a00058a8';
      // const tokenId = 32 + i;
      // const startingTokenBasket = 1;

      // await chargedParticles.energizeParticle(
      //   leptonAddress,
      //   startingTokenBasket + i,
      //   'basic.B',
      //   await dai.getAddress(),
      //   amountDeposit,
      //   '0x0000000000000000000000000000000000000000'
      //   ).then(tx => tx.wait());

        // for(let z = 0; z < leptonMultipliers.length; z++) {
        //   await leptonMock.mock.getMultiplier.returns(leptonMultipliers[z]);
        //   await rewardProgram.registerNftDeposit(
        //     contractAddress,
        //     tokenId,
        //     leptonMock.address,
        //     z,
        //     0
        //   ).then(tx => tx.wait());
        // }

      // const uuid = ethers.utils.solidityKeccak256(['address', 'uint256'], [contractAddress, tokenId]);
      // const uuidBigNumber = ethers.BigNumber.from(uuid);
      // const nftStake = await rewardProgram.getNftStake(uuidBigNumber);

      // expect(nftStake.multiplier).to.be.eq(leptonDepositCases[i].expectedTotalMultiplier);
    });
  }
});