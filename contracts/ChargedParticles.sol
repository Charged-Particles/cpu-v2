// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IERC6551Registry} from "./interfaces/IERC6551Registry.sol";
import {IChargedParticles} from "./interfaces/IChargedParticles.sol";
import {ITokenInfoProxy} from "./interfaces/ITokenInfoProxy.sol";
import {NftTokenType} from "./lib/NftTokenType.sol";
import {ISmartAccount} from "./interfaces/ISmartAccount.sol";
import {SmartAccount} from "./SmartAccount.sol";

contract ChargedParticles is IChargedParticles {
  using NftTokenType for address;

  // ERC6551 Registry
  address public constant REGISTRY = 0x02101dfB77FDE026414827Fdc604ddAF224F0921;

  // NFT contract => SmartAccount Implementation
  mapping (address => address) internal implementations;
  address internal defaultImplementation;

  // Registry Version => Registry Address
  mapping (uint256 => address) internal erc6551registry;
  uint256 internal defaultRegistry;

  ITokenInfoProxy internal _tokenInfoProxy;

  constructor(address executionController) {
    erc6551registry[0] = REGISTRY;
    defaultImplementation = address(new SmartAccount(address(this), executionController));
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Token Info Proxy

  function setTokenInfoProxy(address proxy) external {
    _tokenInfoProxy = ITokenInfoProxy(proxy);
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // ERC6551 Wallet Registry

  function getCurrentRegistry() external view returns (address) {
    return erc6551registry[defaultRegistry];
  }

  function getRegistry(uint256 registry) external view returns (address) {
    return erc6551registry[registry];
  }

  function setRegistry(uint256 version, address registry) external {
    erc6551registry[version] = registry;
  }

  function setDefaultRegistryVersion(uint256 version) external {
    defaultRegistry = version;
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // SmartAccount Implementations with Custom Execution Controllers
  //  - any NFT contract can have its own custom execution controller
  //  - Note: Do not change the implementation after NFTs have already started using one.

  /// @dev ...
  function createCustomImplementation(address nftContract, address executionController) external virtual {
    implementations[nftContract] = address(new SmartAccount(address(this), executionController));
  }

  function getImplementation(address nftContract) public view returns (address implementation) {
    implementation = implementations[nftContract];
    if (implementation == address(0)) {
      implementation = defaultImplementation;
    }
  }


  /***********************************|
  |        Energize Particles         |
  |__________________________________*/


  /// @notice Fund Particle with Asset Token
  ///    Must be called by the account providing the Asset
  ///    Account must Approve THIS contract as Operator of Asset
  ///
  /// @param contractAddress      The Address to the Contract of the Token to Energize
  /// @param tokenId              The ID of the Token to Energize
  /// @param assetToken           The Address of the Asset Token being used
  /// @param assetAmount          The Amount of Asset Token to Energize the Token with
  function energizeParticle(
    address contractAddress,
    uint256 tokenId,
    address assetToken,
    uint256 assetAmount,
    bytes calldata initData
  )
    external
    virtual
    override
    // nonReentrant
  {
    // Find the SmartAccount for this NFT
    address implementation = getImplementation(contractAddress);
    IERC6551Registry registry = IERC6551Registry(erc6551registry[defaultRegistry]);
    address account = registry.createAccount(implementation, block.chainid, contractAddress, tokenId, 0, initData);

    // Transfer to SmartAccount
    IERC20(assetToken).transferFrom(msg.sender, account, assetAmount);

    // Call "update" on SmartAccount
    if (IERC165(account).supportsInterface(type(ISmartAccount).interfaceId)) {
      ISmartAccount(payable(account)).handleTokenUpdate(true, assetToken, assetAmount);
    }
  }

  /***********************************|
  |         Release Particles         |
  |__________________________________*/

  function releaseParticle(
    address receiver,
    address contractAddress,
    uint256 tokenId,
    address assetToken
  )
    external
    virtual
    override
    onlyNFTOwnerOrOperator(contractAddress, tokenId)
    // nonReentrant
    returns (uint256 amount)
  {
    // Find the SmartAccount for this NFT
    address implementation = getImplementation(contractAddress);
    IERC6551Registry registry = IERC6551Registry(erc6551registry[defaultRegistry]);
    address account = registry.account(implementation, block.chainid, contractAddress, tokenId, 0);

    // Transfer to SmartAccount
    uint256 assetAmount = IERC20(assetToken).balanceOf(account);
    IERC20(assetToken).transferFrom(account, receiver, assetAmount);

    // Call "update" on SmartAccount
    if (IERC165(account).supportsInterface(type(ISmartAccount).interfaceId)) {
      ISmartAccount(payable(account)).handleTokenUpdate(false, assetToken, assetAmount);
    }
  }

  function releaseParticleAmount(
    address receiver,
    address contractAddress,
    uint256 tokenId,
    address assetToken,
    uint256 assetAmount
  )
    external
    virtual
    override
    onlyNFTOwnerOrOperator(contractAddress, tokenId)
    // nonReentrant
    returns (uint256 amount)
  {
    // Find the SmartAccount for this NFT
    address implementation = getImplementation(contractAddress);
    IERC6551Registry registry = IERC6551Registry(erc6551registry[defaultRegistry]);
    address account = registry.account(implementation, block.chainid, contractAddress, tokenId, 0);

    // Transfer to SmartAccount
    IERC20(assetToken).transferFrom(account, receiver, assetAmount);

    // Call "update" on SmartAccount
    if (IERC165(account).supportsInterface(type(ISmartAccount).interfaceId)) {
      ISmartAccount(payable(account)).handleTokenUpdate(false, assetToken, assetAmount);
    }
  }


  /***********************************|
  |         Covalent Bonding          |
  |__________________________________*/

  /// @notice Deposit other NFT Assets into the Particle
  ///    Must be called by the account providing the Asset
  ///    Account must Approve THIS contract as Operator of Asset
  ///
  /// @param contractAddress      The Address to the Contract of the Token to Energize
  /// @param tokenId              The ID of the Token to Energize
  /// @param nftTokenAddress      The Address of the NFT Token being deposited
  /// @param nftTokenId           The ID of the NFT Token being deposited
  /// @param nftTokenAmount       The amount of Tokens to Deposit (ERC1155-specific)
  function covalentBond(
    address contractAddress,
    uint256 tokenId,
    address nftTokenAddress,
    uint256 nftTokenId,
    uint256 nftTokenAmount,
    bytes calldata initData
  )
    external
    virtual
    override
    // nonReentrant
    returns (bool success)
  {
    // Find the SmartAccount for this NFT
    address implementation = getImplementation(contractAddress);
    IERC6551Registry registry = IERC6551Registry(erc6551registry[defaultRegistry]);
    address account = registry.createAccount(implementation, block.chainid, contractAddress, tokenId, 0, initData);

    // Transfer to SmartAccount
    if (nftTokenAddress.isERC1155()) {
      IERC1155(nftTokenAddress).safeTransferFrom(msg.sender, account, tokenId, nftTokenAmount, "");
    } else {
      IERC721(nftTokenAddress).safeTransferFrom(msg.sender, account, nftTokenId);
    }

    // Call "update" on SmartAccount
    if (IERC165(account).supportsInterface(type(ISmartAccount).interfaceId)) {
      ISmartAccount(payable(account)).handleNFTUpdate(true, nftTokenAddress, nftTokenId, nftTokenAmount);
    }
    return true;
  }

  /// @notice Release NFT Assets from the Particle
  /// @param receiver             The Address to Receive the Released Asset Tokens
  /// @param contractAddress      The Address to the Contract of the Token to Energize
  /// @param tokenId              The ID of the Token to Energize
  /// @param nftTokenAddress      The Address of the NFT Token being deposited
  /// @param nftTokenId           The ID of the NFT Token being deposited
  /// @param nftTokenAmount       The amount of Tokens to Withdraw (ERC1155-specific)
  function breakCovalentBond(
    address receiver,
    address contractAddress,
    uint256 tokenId,
    address nftTokenAddress,
    uint256 nftTokenId,
    uint256 nftTokenAmount
  )
    external
    virtual
    override
    onlyNFTOwnerOrOperator(contractAddress, tokenId)
    // nonReentrant
    returns (bool success)
  {
    // Find the SmartAccount for this NFT
    address implementation = getImplementation(contractAddress);
    IERC6551Registry registry = IERC6551Registry(erc6551registry[defaultRegistry]);
    address account = registry.account(implementation, block.chainid, contractAddress, tokenId, 0);

    // Transfer to SmartAccount
    if (nftTokenAddress.isERC1155()) {
      IERC1155(nftTokenAddress).safeTransferFrom(account, receiver, tokenId, nftTokenAmount, "");
    } else {
      IERC721(nftTokenAddress).safeTransferFrom(account, receiver, nftTokenId);
    }

    // Call "update" on SmartAccount
    if (IERC165(account).supportsInterface(type(ISmartAccount).interfaceId)) {
      ISmartAccount(payable(account)).handleNFTUpdate(false, nftTokenAddress, nftTokenId, nftTokenAmount);
    }
  }



  modifier onlyNFTOwnerOrOperator(address contractAddress, uint256 tokenId) {
    require(_tokenInfoProxy.isNFTOwnerOrOperator(contractAddress, tokenId, msg.sender), "CP:E-105");
    _;
  }
}
