import { expect } from 'chai';
import { ethers, network, getNamedAccounts, deployments } from 'hardhat';
import { getChargedParticlesOwner } from '../utils/getSigners';
import { UniverseRP, ChargedParticles, ChargedSettings, Ionx, Lepton2, RewardProgram, TokenInfoProxy, IERC20Detailed } from '../typechain-types';
import { addressBook } from '../utils/globals';
import { Signer } from 'ethers';
import { time } from '@nomicfoundation/hardhat-toolbox/network-helpers';

describe('RewardProgramSetupTestnet deployments', async () => {
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;

  let chargedParticles: ChargedParticles, chargedSettings: ChargedSettings, rewardProgram: RewardProgram, tokenInfoProxy: TokenInfoProxy;
  let lepton: Lepton2, ionx: Ionx, universe: UniverseRP, dai: IERC20Detailed;
  let iface, fragment;

  let deployer: string, user: string, chargedOwner: Signer;
  let leptonAddress: string, chargedParticlesAddress: string, ionxAddress: string, universeAddress: string, daiAddress: string;
  let chainId;

  const _energizeNft = async (holderNftId: number, amount: BigInt, manager: string = 'generic.B') => {
    await dai.approve(chargedParticlesAddress, amount.toString()).then(tx => tx.wait());
    return await chargedParticles.connect(await ethers.getSigner(deployer)).energizeParticle(
      leptonAddress,
      holderNftId,
      manager,
      daiAddress,
      amount.toString(),
      '0x0000000000000000000000000000000000000000'
    );
  };

  const _releaseNft = async (holderNftId: number, manager: string = 'generic.B') => {
    return await chargedParticles.connect(await ethers.getSigner(deployer)).releaseParticle(
      deployer,
      leptonAddress,
      holderNftId,
      manager,
      daiAddress
    );
  };

  const _bondNft = async (holderNftId: number, depositNftId: number) => {
    await lepton.approve(chargedParticlesAddress, depositNftId).then(tx => tx.wait());
    return await chargedParticles.connect(await ethers.getSigner(deployer)).covalentBond(
      leptonAddress,
      holderNftId,
      'generic.B',
      leptonAddress,
      depositNftId,
      1 // amount
    ).then(tx => tx.wait());
  };

  const _mintAllLeptons = async () => {
    // Tier 1
    const nftTier1 = 2;
    let price = await lepton.getNextPrice();
    await lepton.batchMintLepton(25, { value: price * 25n }).then(tx => tx.wait());
    await lepton.batchMintLepton(15, { value: price * 15n }).then(tx => tx.wait());

    // Tier 2
    const nftTier2 = 41;
    price = await lepton.getNextPrice();
    await lepton.batchMintLepton(20, { value: price * 20n }).then(tx => tx.wait());

    // Tier 3
    const nftTier3 = 61;
    price = await lepton.getNextPrice();
    await lepton.batchMintLepton(12, { value: price * 12n }).then(tx => tx.wait());

    // Tier 4
    const nftTier4 = 73;
    price = await lepton.getNextPrice();
    await lepton.batchMintLepton(8, { value: price * 8n }).then(tx => tx.wait());

    // Tier 5
    const nftTier5 = 81;
    price = await lepton.getNextPrice();
    await lepton.batchMintLepton(5, { value: price * 5n }).then(tx => tx.wait());

    // Tier 6
    const nftTier6 = 86;
    price = await lepton.getNextPrice();
    await lepton.batchMintLepton(2, { value: price * 2n }).then(tx => tx.wait());

    // Confirm Count
    expect(await lepton.balanceOf(deployer)).to.be.eq(87);

    return { tier1: nftTier1, tier2: nftTier2, tier3: nftTier3, tier4: nftTier4, tier5: nftTier5, tier6: nftTier6 }
  };

  const atLeast = (min: bigint) => (value: bigint):boolean => {
    return value >= min;
  };

  //
  //  Before/After Hooks
  //

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
    universe = await ethers.getContract('UniverseRP');
    rewardProgram = await ethers.getContract('RewardProgramDAI');
    chargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles, chargedOwner);
    chargedSettings = await ethers.getContractAt('ChargedSettings', addressBook[chainId].chargedSettings, chargedOwner);
    tokenInfoProxy = await ethers.getContractAt('TokenInfoProxy', addressBook[chainId].tokenInfoProxy, chargedOwner);
    dai = await ethers.getContractAt('IERC20Detailed', addressBook[chainId].stakingTokens[0].address);

    universeAddress = await universe.getAddress();
    leptonAddress = await lepton.getAddress();
    ionxAddress = await ionx.getAddress();
    chargedParticlesAddress = await chargedParticles.getAddress();
    daiAddress = await dai.getAddress();

    await chargedSettings.enableNftContracts([ leptonAddress ]).then(tx => tx.wait());

    iface = new ethers.Interface([ 'function ownerOf(uint256)' ]);
    fragment = iface.getFunction('ownerOf');
    if (fragment !== null) {
      tokenInfoProxy.setContractFnCreatorOf(leptonAddress, fragment.selector);
    }
  });

  //
  // Unit-Tests
  //

  it ('is Bondable', async () => {
    const price = await lepton.getNextPrice();
    await lepton.batchMintLepton(2, { value: price * 2n }).then(tx => tx.wait());
    expect(await lepton.balanceOf(deployer)).to.be.eq(2);

    await expect(_bondNft(1, 2)).to.emit(universe, 'NftDeposit');
    expect(await lepton.balanceOf(deployer)).to.be.eq(1);
  });

  it ('is Energizable', async () => {
    const price = await lepton.getNextPrice();
    await lepton.mintLepton({ value: price }).then(tx => tx.wait());

    const amountDeposit: BigInt = ethers.parseEther('.1');
    await expect(_energizeNft(1, amountDeposit))
      .to.emit(rewardProgram, 'AssetDeposit')
      .withArgs(leptonAddress, 1, 'generic.B', amountDeposit);
  });

  it('Registers Multiplier NFTs', async () => {
    const nestedUuid = ethers.solidityPackedKeccak256([ 'address', 'uint256' ], [leptonAddress, 1]);
    const nfts = await _mintAllLeptons();

    // Confirm Multiplier on Single Lepton Deposit
    await expect(_bondNft(1, nfts.tier1)).to.emit(universe, 'NftDeposit');
    let nftStake = await universe.getNftStake(nestedUuid);
    expect(nftStake[0]).to.be.eq(110); // Tier 1

    // Confirm Multiplier on Second Lepton Deposit
    await expect(_bondNft(1, nfts.tier2)).to.emit(universe, 'NftDeposit');
    nftStake = await universe.getNftStake(nestedUuid);
    expect(nftStake[0]).to.be.eq(140); // Tier 1 + 2

    // Confirm Multiplier on Third Lepton Deposit
    await expect(_bondNft(1, nfts.tier3)).to.emit(universe, 'NftDeposit');
    nftStake = await universe.getNftStake(nestedUuid);
    expect(nftStake[0]).to.be.eq(240); // Tier 1 + 2 + 3

    // Confirm Multiplier on Fourth Lepton Deposit
    await expect(_bondNft(1, nfts.tier4)).to.emit(universe, 'NftDeposit');
    nftStake = await universe.getNftStake(nestedUuid);
    expect(nftStake[0]).to.be.eq(370); // Tier 1 + 2 + 3 + 4

    // Confirm Multiplier on Fourth Lepton Deposit
    await expect(_bondNft(1, nfts.tier5)).to.emit(universe, 'NftDeposit');
    nftStake = await universe.getNftStake(nestedUuid);
    expect(nftStake[0]).to.be.eq(550); // Tier 1 + 2 + 3 + 4 + 5

    // Confirm Multiplier on Fourth Lepton Deposit
    await expect(_bondNft(1, nfts.tier6)).to.emit(universe, 'NftDeposit');
    nftStake = await universe.getNftStake(nestedUuid);
    expect(nftStake[0]).to.be.eq(1010); // Tier 1 + 2 + 3 + 4 + 5 + 6
  });

  it ('Rewards without Lepton Multiplier', async () => {
    const price = await lepton.getNextPrice();
    await lepton.mintLepton({ value: price }).then(tx => tx.wait());
    expect(await lepton.balanceOf(deployer)).to.be.eq(1);

    const amountDeposit: BigInt = ethers.parseEther('1');
    await expect(_energizeNft(1, amountDeposit, 'aave.B'))
      .to.emit(rewardProgram, 'AssetDeposit')
      .withArgs(leptonAddress, 1, 'aave.B', amountDeposit);

    const timeDelay = (await time.latest()) + ONE_YEAR_IN_SECS;
    await time.increaseTo(timeDelay);

    const expectedAaveInterest = ethers.parseEther('0.12611');
    const expectedIonxReward = expectedAaveInterest * 2n; //  2:1 ratio

    await expect(_releaseNft(1, 'aave.B'))
      .to.emit(rewardProgram, 'AssetRelease')
        .withArgs(leptonAddress, 1, atLeast(expectedAaveInterest))
      .to.emit(rewardProgram, 'RewardsClaimed')
        .withArgs(leptonAddress, 1, deployer, atLeast(expectedIonxReward), 0);
  });

  it('Rewards with One Lepton Multiplier', async () => {
    const price = await lepton.getNextPrice();
    await lepton.batchMintLepton(2, { value: price * 2n }).then(tx => tx.wait());
    expect(await lepton.balanceOf(deployer)).to.be.eq(2);

    // Confirm Multiplier on Single Lepton Deposit
    const nestedUuid = ethers.solidityPackedKeccak256([ 'address', 'uint256' ], [leptonAddress, 1]);
    await expect(_bondNft(1, 2)).to.emit(universe, 'NftDeposit');
    let nftStake = await universe.getNftStake(nestedUuid);
    expect(nftStake[0]).to.be.eq(110); // Tier 1

    // Deposit DAI into Aave
    const amountDeposit: BigInt = ethers.parseEther('1');
    await expect(_energizeNft(1, amountDeposit, 'aave.B'))
      .to.emit(rewardProgram, 'AssetDeposit')
      .withArgs(leptonAddress, 1, 'aave.B', amountDeposit);

    // Increase Blocktime
    const timeDelay = (await time.latest()) + ONE_YEAR_IN_SECS;
    await time.increaseTo(timeDelay);

    const expectedAaveInterest = ethers.parseEther('0.12611');
    let expectedIonxReward = (expectedAaveInterest * 2n); //  2:1 ratio
    expectedIonxReward = (expectedIonxReward * 110n / 1000n); //  + 1.1x multiplier

    // Release Assets and Confirm
    const releaseState = _releaseNft(1, 'aave.B');
    await expect(releaseState)
      .to.emit(rewardProgram, 'AssetRelease')
        .withArgs(leptonAddress, 1, atLeast(expectedAaveInterest));
    await expect(releaseState)
      .to.emit(rewardProgram, 'RewardsClaimed')
        .withArgs(leptonAddress, 1, deployer, atLeast(expectedIonxReward), 0);
  });

  it('Rewards with Two Lepton Multipliers', async () => {
    const nfts = await _mintAllLeptons();

    // Confirm Multiplier on Two Lepton Deposits
    const nestedUuid = ethers.solidityPackedKeccak256([ 'address', 'uint256' ], [leptonAddress, 1]);
    await expect(_bondNft(1, nfts.tier1)).to.emit(universe, 'NftDeposit');
    await expect(_bondNft(1, nfts.tier2)).to.emit(universe, 'NftDeposit');

    let nftStake = await universe.getNftStake(nestedUuid);
    expect(nftStake[0]).to.be.eq(140); // Tier 1 + Tier 2

    // Deposit DAI into Aave
    const amountDeposit: BigInt = ethers.parseEther('1');
    await expect(_energizeNft(1, amountDeposit, 'aave.B'))
      .to.emit(rewardProgram, 'AssetDeposit')
      .withArgs(leptonAddress, 1, 'aave.B', amountDeposit);

    // Increase Blocktime
    const timeDelay = (await time.latest()) + ONE_YEAR_IN_SECS;
    await time.increaseTo(timeDelay);

    const expectedAaveInterest = ethers.parseEther('0.12611');
    let expectedIonxReward = (expectedAaveInterest * 2n); //  2:1 ratio
    expectedIonxReward = (expectedIonxReward * 140n / 1000n); //  + 1.4x multiplier

    // Release Assets and Confirm
    const releaseState = _releaseNft(1, 'aave.B');
    await expect(releaseState)
      .to.emit(rewardProgram, 'AssetRelease')
        .withArgs(leptonAddress, 1, atLeast(expectedAaveInterest));
    await expect(releaseState)
      .to.emit(rewardProgram, 'RewardsClaimed')
        .withArgs(leptonAddress, 1, deployer, atLeast(expectedIonxReward), 0);
  });

  it('Rewards with Six Lepton Multipliers', async () => {
    const nfts = await _mintAllLeptons();

    // Confirm Multiplier on Six Lepton Deposits
    const nestedUuid = ethers.solidityPackedKeccak256([ 'address', 'uint256' ], [leptonAddress, 1]);
    await expect(_bondNft(1, nfts.tier1)).to.emit(universe, 'NftDeposit');
    await expect(_bondNft(1, nfts.tier2)).to.emit(universe, 'NftDeposit');
    await expect(_bondNft(1, nfts.tier3)).to.emit(universe, 'NftDeposit');
    await expect(_bondNft(1, nfts.tier4)).to.emit(universe, 'NftDeposit');
    await expect(_bondNft(1, nfts.tier5)).to.emit(universe, 'NftDeposit');
    await expect(_bondNft(1, nfts.tier6)).to.emit(universe, 'NftDeposit');

    let nftStake = await universe.getNftStake(nestedUuid);
    expect(nftStake[0]).to.be.eq(1010); // Tier 1 + 2 + 3 + 4 + 5 + 6

    // Deposit DAI into Aave
    const amountDeposit: BigInt = ethers.parseEther('1');
    await expect(_energizeNft(1, amountDeposit, 'aave.B'))
      .to.emit(rewardProgram, 'AssetDeposit')
      .withArgs(leptonAddress, 1, 'aave.B', amountDeposit);

    // Increase Blocktime
    const timeDelay = (await time.latest()) + ONE_YEAR_IN_SECS;
    await time.increaseTo(timeDelay);

    const expectedAaveInterest = ethers.parseEther('0.12611');
    let expectedIonxReward = (expectedAaveInterest * 2n); //  2:1 ratio
    expectedIonxReward = (expectedIonxReward * 1010n / 1000n); //  + 10.1x multiplier

    // Release Assets and Confirm
    const releaseState = _releaseNft(1, 'aave.B');
    await expect(releaseState)
      .to.emit(rewardProgram, 'AssetRelease')
        .withArgs(leptonAddress, 1, atLeast(expectedAaveInterest));
    await expect(releaseState)
      .to.emit(rewardProgram, 'RewardsClaimed')
        .withArgs(leptonAddress, 1, deployer, atLeast(expectedIonxReward), 0);
  });
});