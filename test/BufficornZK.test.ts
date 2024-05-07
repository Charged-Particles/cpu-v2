import * as hre from 'hardhat';
import { Wallet, Contract } from 'zksync-ethers';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { expect } from 'chai';

import { getWallet, getProvider, deployContract, LOCAL_RICH_WALLETS } from '../utils/utils';
import { performTx } from '../utils/performTx';
import { calculateAccountAddress } from '../utils/calculateAccountAddress';

import DeployRegistry from '../deploy/ERC6551zkSyncRegistry';
import DeployBufficornZK from '../deploy/BufficornZK';
import DeploySmartAccount from '../deploy/SmartAccount';
import DeployERC20Mock from '../deploy/ERC20Mock';
import DeployNFTMock from '../deploy/NFTMock';
import DeploySmartAccountController from '../deploy/SAC_EX1';


describe('BufficornZK', async function () {
  let _chainId: bigint;

  // Contracts
  let _chargedParticles: Contract;
  let _bufficorn: Contract;
  let _nftMock: Contract;
  let _erc20Mock: Contract;

  // Addresses
  let _chargedParticlesAddress: string;
  let _bufficornAddress: string;
  let _zkSyncRegistryAddress: string;
  let _nftMockAddress: string;
  let _erc20MockAddress: string;

  // Signers
  let _wallet: Wallet;
  let _deployer: Deployer;
  let _deployerAddress: string;
  let _receiver: string;

  const getChainId = async () => {
    const provider = getProvider();
    const network = await provider.getNetwork();
    return network.chainId;
  };

  before(async function () {
    _wallet = getWallet();
    _deployer = new Deployer(hre, _wallet);
    _deployerAddress = _deployer.ethWallet.address;
    _receiver = LOCAL_RICH_WALLETS[1].address;
    _chainId = await getChainId();

    // Deploy ERC20 Mock
    const { contract: erc20Mock, address: erc20MockAddress } = await DeployERC20Mock();
    _erc20Mock = erc20Mock;
    _erc20MockAddress = erc20MockAddress;

    // Deploy NFT Mock
    const { contract: nftMock, address: nftMockAddress } = await DeployNFTMock();
    _nftMock = nftMock;
    _nftMockAddress = nftMockAddress;

    // Deploy zkSyncRegistry
    const { contract: zkSyncRegistry, address: zkSyncRegistryAddress } = await DeployRegistry();
    _zkSyncRegistryAddress = zkSyncRegistryAddress;

    // Deploy SmartAccount
    const { bytecodeHash: smartAccountHash } = await DeploySmartAccount();

    // Deploy Charged Particles
    const constructorArgs = [
      zkSyncRegistryAddress,  // ERC6551zkSyncRegistry - Manual Deploy on zkEVM Chains
      smartAccountHash,       // BytecodeHash for Pre-deployed SmartAccount contract
    ]
    const { contract: chargedParticles, address: chargedParticlesAddress } = await deployContract('ChargedParticles', constructorArgs);
    _chargedParticles = chargedParticles;
    _chargedParticlesAddress = chargedParticlesAddress;

    // Deploy SmartAccountController_Example1
    const { contract: sac, address: sacAddress, bytecodeHash: sacHash } = await DeploySmartAccountController();

    // Set Default Execution Controller
    await performTx(await _chargedParticles.setDefaultExecutionController(sacAddress), '');
  });


  beforeEach(async function () {
    // Deploy BufficornZK NFT
    const { contract: bufficorn, address: bufficornAddress } = await DeployBufficornZK();
    _bufficorn = bufficorn;
    _bufficornAddress = bufficornAddress;

    // Set Base Token URI on the BufficornZK contract
    await performTx(await bufficorn.setBaseURI('http://www.bufficorn-zk.com/'), '');

    // Set Custom Execution Controller as the BufficornZK contract
    await performTx(
      await _chargedParticles.setCustomExecutionController(bufficornAddress, bufficornAddress), // NFT Contract, Execution Controller  (in this case, they happen to be the same)
      ''
    );
  });


  it('Manages Trait-Swapping when NFTs are Added and Removed', async function () {
    const bufficornTokenId = 1;

    // Mint a Bufficorn NFT
    await _bufficorn.mint(bufficornTokenId).then(tx => tx.wait()); // Token ID: 1
    expect(await _bufficorn.balanceOf(_deployerAddress)).to.be.equal(1);

    // Confirm Zero Traits
    expect(await _bufficorn.getTraits(bufficornTokenId)).to.be.equal(0);

    // Mint some Bufficorn Trait-NFTs
    await _bufficorn.mintWithTraits(2, 1n)  //  Token ID: 2, Trait-bit = 00000001
    await _bufficorn.mintWithTraits(3, 2n)  //  Token ID: 3, Trait-bit = 00000010
    await _bufficorn.mintWithTraits(4, 4n)  //  Token ID: 4, Trait-bit = 00000100
    await _bufficorn.mintWithTraits(5, 8n)  //  Token ID: 5, Trait-bit = 00001000
    await _bufficorn.mintWithTraits(6, 16n) //  Token ID: 6, Trait-bit = 00010000
    expect(await _bufficorn.balanceOf(_deployerAddress)).to.be.equal(6);

    // Confirm Traits
    expect(await _bufficorn.getTraits(2)).to.be.equal(1n);
    expect(await _bufficorn.getTraits(3)).to.be.equal(2n);
    expect(await _bufficorn.getTraits(4)).to.be.equal(4n);
    expect(await _bufficorn.getTraits(5)).to.be.equal(8n);
    expect(await _bufficorn.getTraits(6)).to.be.equal(16n);

    // Calculate Expected Account Address via Registry
    const newAccountAddress = await calculateAccountAddress(_chargedParticles, _zkSyncRegistryAddress, _bufficornAddress, bufficornTokenId, _chainId);
    expect(newAccountAddress).to.not.be.empty;

    // Give permission to Bond
    await _bufficorn.approve(_chargedParticlesAddress, 2).then(tx => tx.wait());
    await _bufficorn.approve(_chargedParticlesAddress, 3).then(tx => tx.wait());
    await _bufficorn.approve(_chargedParticlesAddress, 4).then(tx => tx.wait());
    await _bufficorn.approve(_chargedParticlesAddress, 5).then(tx => tx.wait());
    await _bufficorn.approve(_chargedParticlesAddress, 6).then(tx => tx.wait());

    // Bond Trait 1 to Bufficorn
    await _chargedParticles.covalentBond(_bufficornAddress, bufficornTokenId, _bufficornAddress, 2, 1n).then(tx => tx.wait());

    // Confirm Nested Trait-NFT Owner
    expect(await _bufficorn.ownerOf(2)).to.be.eq(newAccountAddress);

    // Confirm Bufficorn Traits
    expect(await _bufficorn.getTraits(bufficornTokenId)).to.be.eq(1n); // Bufficorn has a Single Trait (00000001)

    // Bond and Confirm Trait 2
    await _chargedParticles.covalentBond(_bufficornAddress, bufficornTokenId, _bufficornAddress, 3, 1n).then(tx => tx.wait());
    expect(await _bufficorn.ownerOf(3)).to.be.eq(newAccountAddress);
    expect(await _bufficorn.getTraits(bufficornTokenId)).to.be.eq(3n); // Bufficorn has 2 Traits (00000011)

    // Bond and Confirm Trait 3
    await _chargedParticles.covalentBond(_bufficornAddress, bufficornTokenId, _bufficornAddress, 4, 1n).then(tx => tx.wait());
    expect(await _bufficorn.ownerOf(4)).to.be.eq(newAccountAddress);
    expect(await _bufficorn.getTraits(bufficornTokenId)).to.be.eq(7n); // Bufficorn has 3 Traits (00000111)

    // Bond and Confirm Trait 4
    await _chargedParticles.covalentBond(_bufficornAddress, bufficornTokenId, _bufficornAddress, 5, 1n).then(tx => tx.wait());
    expect(await _bufficorn.ownerOf(5)).to.be.eq(newAccountAddress);
    expect(await _bufficorn.getTraits(bufficornTokenId)).to.be.eq(15n); // Bufficorn has 4 Traits (00001111)

    // Bond and Confirm Trait 5
    await _chargedParticles.covalentBond(_bufficornAddress, bufficornTokenId, _bufficornAddress, 6, 1n).then(tx => tx.wait());
    expect(await _bufficorn.ownerOf(6)).to.be.eq(newAccountAddress);
    expect(await _bufficorn.getTraits(bufficornTokenId)).to.be.eq(31n); // Bufficorn has 5 Traits (00011111)


    // Break-Bond Trait 3 from Bufficorn
    await _chargedParticles.breakCovalentBond(_deployerAddress, _bufficornAddress, bufficornTokenId, _bufficornAddress, 4, 1n).then(tx => tx.wait());

    // Confirm Nested Trait-NFT Owner
    expect(await _bufficorn.ownerOf(4)).to.be.eq(_deployerAddress);

    // Confirm Bufficorn Traits
    expect(await _bufficorn.getTraits(bufficornTokenId)).to.be.eq(27n); // Bufficorn has 4 Traits (00011011)

    // Break-Bond and Confirm Trait 2 Removed
    await _chargedParticles.breakCovalentBond(_deployerAddress, _bufficornAddress, bufficornTokenId, _bufficornAddress, 3, 1n).then(tx => tx.wait());
    expect(await _bufficorn.ownerOf(3)).to.be.eq(_deployerAddress);
    expect(await _bufficorn.getTraits(bufficornTokenId)).to.be.eq(25n); // Bufficorn has 3 Traits (00011001)

    // Break-Bond and Confirm Trait 5 Removed
    await _chargedParticles.breakCovalentBond(_deployerAddress, _bufficornAddress, bufficornTokenId, _bufficornAddress, 6, 1n).then(tx => tx.wait());
    expect(await _bufficorn.ownerOf(6)).to.be.eq(_deployerAddress);
    expect(await _bufficorn.getTraits(bufficornTokenId)).to.be.eq(9n); // Bufficorn has 2 Traits (00001001)

    // Break-Bond and Confirm Trait 1 Removed
    await _chargedParticles.breakCovalentBond(_deployerAddress, _bufficornAddress, bufficornTokenId, _bufficornAddress, 2, 1n).then(tx => tx.wait());
    expect(await _bufficorn.ownerOf(2)).to.be.eq(_deployerAddress);
    expect(await _bufficorn.getTraits(bufficornTokenId)).to.be.eq(8n); // Bufficorn has 1 Trait (00001000)

    // Break-Bond and Confirm Trait 4 Removed
    await _chargedParticles.breakCovalentBond(_deployerAddress, _bufficornAddress, bufficornTokenId, _bufficornAddress, 5, 1n).then(tx => tx.wait());
    expect(await _bufficorn.ownerOf(5)).to.be.eq(_deployerAddress);
    expect(await _bufficorn.getTraits(bufficornTokenId)).to.be.eq(0); // Bufficorn has 0 Traits (00000000)

    // Confirm Owner of all NFTs
    expect(await _bufficorn.balanceOf(_deployerAddress)).to.be.equal(6);
  });

  it('includes the Traits in the TokenURI', async function () {
    const bufficornTokenId = 1;

    // Mint a Bufficorn NFT
    await _bufficorn.mint(bufficornTokenId).then(tx => tx.wait()); // Token ID: 1
    expect(await _bufficorn.balanceOf(_deployerAddress)).to.be.equal(1);

    // Confirm Zero Traits
    expect(await _bufficorn.getTraits(bufficornTokenId)).to.be.equal(0);

    // Mint some Bufficorn Trait-NFTs
    await _bufficorn.mintWithTraits(2, 1n)  //  Token ID: 2, Trait-bit = 00000001
    await _bufficorn.mintWithTraits(3, 2n)  //  Token ID: 3, Trait-bit = 00000010
    await _bufficorn.mintWithTraits(4, 4n)  //  Token ID: 4, Trait-bit = 00000100
    await _bufficorn.mintWithTraits(5, 8n)  //  Token ID: 5, Trait-bit = 00001000
    await _bufficorn.mintWithTraits(6, 16n) //  Token ID: 6, Trait-bit = 00010000
    expect(await _bufficorn.balanceOf(_deployerAddress)).to.be.equal(6);

    // Calculate Expected Account Address via Registry
    const newAccountAddress = await calculateAccountAddress(_chargedParticles, _zkSyncRegistryAddress, _bufficornAddress, bufficornTokenId, _chainId);
    expect(newAccountAddress).to.not.be.empty;

    // Give permission to Bond
    await _bufficorn.approve(_chargedParticlesAddress, 2).then(tx => tx.wait());
    await _bufficorn.approve(_chargedParticlesAddress, 3).then(tx => tx.wait());
    await _bufficorn.approve(_chargedParticlesAddress, 4).then(tx => tx.wait());
    await _bufficorn.approve(_chargedParticlesAddress, 5).then(tx => tx.wait());
    await _bufficorn.approve(_chargedParticlesAddress, 6).then(tx => tx.wait());

    // Bond Traits to Bufficorn
    await _chargedParticles.covalentBond(_bufficornAddress, bufficornTokenId, _bufficornAddress, 2, 1n).then(tx => tx.wait());
    await _chargedParticles.covalentBond(_bufficornAddress, bufficornTokenId, _bufficornAddress, 3, 1n).then(tx => tx.wait());
    await _chargedParticles.covalentBond(_bufficornAddress, bufficornTokenId, _bufficornAddress, 4, 1n).then(tx => tx.wait());
    await _chargedParticles.covalentBond(_bufficornAddress, bufficornTokenId, _bufficornAddress, 5, 1n).then(tx => tx.wait());
    await _chargedParticles.covalentBond(_bufficornAddress, bufficornTokenId, _bufficornAddress, 6, 1n).then(tx => tx.wait());

    // Confirm Token URI includes Traits
    const tokenUri = await _bufficorn.tokenURI(bufficornTokenId);
    expect(tokenUri).to.be.equal('http://www.bufficorn-zk.com/1/31');
  });
});
