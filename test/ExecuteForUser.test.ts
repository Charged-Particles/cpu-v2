import { expect } from "chai";
import { ethers, getNamedAccounts, network } from 'hardhat';
import { addressBook } from "../utils/globals";
import { ProtonC, IERC20Detailed, ChargedParticles, AaveWalletManager } from "../typechain-types";

describe('Execute calls', async function () {
  // Contracts
  let dai: IERC20Detailed;
  let proton: ProtonC;
  let chargedParticles: ChargedParticles;
  let aaveManager: AaveWalletManager;

  // Addresses
  let adaiAddress: string;

  // Signers
  let deployer: string, receiver: string;

  let chainId: number;

  before(async () => {
    const { deployer: deployerAccount, user1 } = await getNamedAccounts();
    deployer = deployerAccount;
    receiver = user1;
  });

  beforeEach(async () => {
    chainId = network.config.chainId ?? 80001;

    if (chainId != 80001) {
      throw new Error('Only run ExecuteForUser.test under hardhat test fork network')
    };

    adaiAddress = addressBook[chainId].stakingTokens[0].aave
    // set up proton
    proton = await ethers.getContractAt('ProtonC', addressBook[chainId].protonC);

    // set up DAI
    dai = await ethers.getContractAt('IERC20Detailed', addressBook[chainId].stakingTokens[0].address);

    chargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles);
    aaveManager = await ethers.getContractAt('AaveWalletManager', '0xa8BaA965C302F748197C25a5217fb5b7c7a8C678');
  });

  it('Energize and remove', async() => {
    // Mint a Proton
    const tokenId = await proton.createBasicProton.staticCall(deployer, deployer, 'asdf');

    const amountDeposit: BigInt = ethers.parseEther('.1');
    await dai.approve(addressBook[chainId].chargedParticles, amountDeposit.toString()).then(tx => tx.wait());

    const energizeTx =  await chargedParticles.connect(await ethers.getSigner(deployer)).energizeParticle(
      addressBook[chainId].protonC,
      tokenId,
      'aave',
      await dai.getAddress(),
      amountDeposit.toString(),
      '0x0000000000000000000000000000000000000000'
    ).then(tx => tx.wait());

    // mass 
    const mass = await chargedParticles.baseParticleMass.staticCall(
      addressBook[chainId].protonC,
      tokenId,
      'aave',
      await dai.getAddress(),
    );

    expect(mass).to.eq(amountDeposit);

    const dischargeInterface = (recipient: string, amount: BigInt) => {
      const ABI = ["function transfer(address recipient, uint256 amount)"];
      const iface = new ethers.Interface(ABI);
      const cdata = iface.encodeFunctionData("transfer", [recipient, amount]); 

      return cdata;
    };

    const dischargeCallData = dischargeInterface(deployer, amountDeposit); 

    // Add executor 
    await aaveManager.setController(deployer).then(tx => tx.wait());
    const aDAI = await ethers.getContractAt('IERC20Detailed', adaiAddress);
    const balanceBefore = await aDAI.balanceOf.staticCall(deployer);

    await aaveManager.executeForAccount(
      addressBook[chainId].protonC,
      tokenId,
      adaiAddress, 
      0,
      dischargeCallData,
    ).then(tx => tx.wait());

    const savedBalance = await aDAI.balanceOf.staticCall(deployer);
    expect(balanceBefore).to.be.lessThan(savedBalance)
  });
});
