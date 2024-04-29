// SPDX-License-Identifier: MIT

// ChargedParticles.sol -- Part of the Charged Particles Protocol
// Copyright (c) 2024 Firma Lux, Inc. <https://charged.fi>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

pragma solidity ^0.8.13;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import {IERC2612} from "erc20permit/contracts/IERC2612.sol";
import {ERC20Permit} from "erc20permit/contracts/ERC20Permit.sol";

import {IERC6551Executable} from "./interfaces/IERC6551Executable.sol";
import {IERC6551zkSyncRegistry} from "./interfaces/IERC6551zkSyncRegistry.sol";
import {IChargedParticles} from "./interfaces/IChargedParticles.sol";
import {NftTokenInfo} from "./lib/NftTokenInfo.sol";
import {ISmartAccount} from "./interfaces/ISmartAccount.sol";
import {ISmartAccountController} from "./interfaces/ISmartAccountController.sol";
import {IDynamicTraits} from "./interfaces/IDynamicTraits.sol";
import {SmartAccountTimelocks} from "./extensions/SmartAccountTimelocks.sol";


contract ChargedParticles is IChargedParticles, Ownable, ReentrancyGuard {
  using NftTokenInfo for address;
  using SafeERC20 for IERC20;

  // NFT contract => SmartAccount BytecodeHash
  mapping (address => bytes32) internal accountHashes; // on zkSync these are the "bytecodeHash" of a deployed contract
  bytes32 internal defaultAccountBytecodeHash;

  // NFT contract => Execution Controller
  mapping (address => address) internal executionControllers;
  address internal defaultExecutionController;

  // Registry Version => Registry Address
  mapping (uint256 => address) internal erc6551registry;
  uint256 internal defaultRegistry;

  // Token UUID => Smart Account Address (for View functions)
  mapping (uint256 => address) internal nftSmartAccounts;

  // Default Salt for "create2"
  bytes32 internal defaultSalt;


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Initialization

  constructor(address registry, bytes32 bytecodeHash) Ownable() ReentrancyGuard() {
    erc6551registry[defaultRegistry] = registry;
    defaultAccountBytecodeHash = bytecodeHash; // for zkSync
    defaultSalt = bytes32('CPU-V2');
  }

  // function getInterfaceId() public view returns (bytes4) {
  //   return type(ISmartAccount).interfaceId;
  // }



  function getSmartAccountAddress(address contractAddress, uint256 tokenId) external view override virtual returns (address) {
    (address account, ) = _findAccount(contractAddress, tokenId);
    return account;
  }


  /// @notice Gets the Amount of Asset Tokens that have been Deposited into the Particle
  /// representing the Mass of the Particle.
  /// @param contractAddress      The Address to the Contract of the Token
  /// @param tokenId              The ID of the Token
  /// @param assetToken           The Address of the Asset Token to check
  /// @return total               The Amount of underlying Assets held within the Token
  function baseParticleMass(
    address contractAddress,
    uint256 tokenId,
    address assetToken
  )
    external
    view
    virtual
    override
    returns (uint256 total)
  {
    // Find the SmartAccount for this NFT
    (address account, bool isSmartAccount) = _findAccount(contractAddress, tokenId);
    if (isSmartAccount) {
      ISmartAccount smartAccount = ISmartAccount(payable(account));
      total = smartAccount.getPrincipal(assetToken);
    }
  }

  /// @notice Gets the amount of Interest that the Particle has generated representing
  /// the Charge of the Particle
  /// @param contractAddress      The Address to the Contract of the Token
  /// @param tokenId              The ID of the Token
  /// @param assetToken           The Address of the Asset Token to check
  /// @return total               The amount of interest the Token has generated (in Asset Token)
  function currentParticleCharge(
    address contractAddress,
    uint256 tokenId,
    address assetToken
  )
    external
    view
    virtual
    override
    returns (uint256 total)
  {
    // Find the SmartAccount for this NFT
    (address account, bool isSmartAccount) = _findAccount(contractAddress, tokenId);
    if (isSmartAccount) {
      ISmartAccount smartAccount = ISmartAccount(payable(account));
      total = smartAccount.getInterest(assetToken);
    }
  }

  function currentParticleKinetics(
    address contractAddress,
    uint256 tokenId,
    address assetToken
  )
    external
    view
    virtual
    override
    returns (uint256 total)
  {
    // Find the SmartAccount for this NFT
    (address account, bool isSmartAccount) = _findAccount(contractAddress, tokenId);
    if (isSmartAccount) {
      ISmartAccount smartAccount = ISmartAccount(payable(account));
      total = smartAccount.getRewards(assetToken);
    }
  }

  /// @notice Gets the total amount of ERC721 Tokens that the Particle holds
  /// @param contractAddress  The Address to the Contract of the Token
  /// @param tokenId          The ID of the Token (for ERC1155)
  /// @return total           The total amount of ERC721 tokens that are held within the Particle
  function currentParticleCovalentBonds(
    address contractAddress,
    uint256 tokenId,
    address nftContractAddress,
    uint256 nftTokenId
  )
    external
    view
    virtual
    override
    returns (uint256 total)
  {
    // Find the SmartAccount for this NFT
    (address account, bool isSmartAccount) = _findAccount(contractAddress, tokenId);
    if (isSmartAccount) {
      ISmartAccount smartAccount = ISmartAccount(payable(account));
      total = smartAccount.getCovalentBonds(nftContractAddress, nftTokenId);
    }
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Energize (Deposit)

  /// @notice Fund Particle with Asset Token
  ///    Must be called by the account providing the Asset
  ///    Account must Approve THIS contract as Operator of Asset
  ///
  /// @param contractAddress      The Address to the Contract of the Token to Energize
  /// @param tokenId              The ID of the Token to Energize
  /// @param assetToken           The Address of the Asset Token being used
  /// @param assetAmount          The Amount of Asset Token to Energize the Token with
  /// @return account             The address of the SmartAccount associated with the NFT
  function energizeParticle(
    address contractAddress,
    uint256 tokenId,
    address assetToken,
    uint256 assetAmount
  )
    external
    virtual
    override
    nonReentrant
    returns (address account)
  {
    // Find the SmartAccount for this NFT
    (address accountAddress, bool isSmartAccount) = _createAccount(contractAddress, tokenId);
    account = accountAddress;
    ISmartAccount smartAccount = ISmartAccount(payable(account));

    // Transfer to SmartAccount
    IERC20(assetToken).safeTransferFrom(msg.sender, account, assetAmount);

    // Pre-approve Charged Particles to transfer back out
    IERC6551Executable(account).execute(assetToken, 0, abi.encodeWithSelector(IERC20.approve.selector, address(this), type(uint256).max), 0);

    // Call "update" on SmartAccount
    if (isSmartAccount) {
      smartAccount.handleTokenUpdate(true, assetToken, assetAmount);
    }

    emit NewAccountCreated(account, block.chainid, contractAddress, tokenId);
  }

  /// @notice Fund Particle with Asset Token
  ///    Must be called by the account providing the Asset
  ///    Account must Approve THIS contract as Operator of Asset
  ///
  /// @param contractAddress      The Address to the Contract of the Token to Energize
  /// @param tokenId              The ID of the Token to Energize
  /// @param assetToken           The Address of the Asset Token being used
  /// @param assetAmount          The Amount of Asset Token to Energize the Token with
  /// @return account             The address of the SmartAccount associated with the NFT
  function energizeParticleWithPermit(
    address contractAddress,
    uint256 tokenId,
    address assetToken,
    uint256 assetAmount,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  )
    external
    virtual
    override
    nonReentrant
    returns (address account)
  {
    require(IERC165(assetToken).supportsInterface(type(IERC2612).interfaceId), "permit not supported");

    // Find the SmartAccount for this NFT
    (address accountAddress, bool isSmartAccount) = _createAccount(contractAddress, tokenId);
    account = accountAddress;
    ISmartAccount smartAccount = ISmartAccount(payable(account));

    // Transfer to SmartAccount with Permission
    ERC20Permit(assetToken).permit(msg.sender, address(this), assetAmount, deadline, v, r, s);
    IERC20(assetToken).safeTransferFrom(msg.sender, account, assetAmount);

    // Pre-approve Charged Particles to transfer back out
    IERC6551Executable(account).execute(assetToken, 0, abi.encodeWithSelector(IERC20.approve.selector, address(this), type(uint256).max), 0);

    // Call "update" on SmartAccount
    if (isSmartAccount) {
      smartAccount.handleTokenUpdate(true, assetToken, assetAmount);
    }

    emit NewAccountCreated(account, block.chainid, contractAddress, tokenId);
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Release (Withdraw)

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
    nonReentrant
    returns (uint256 amount)
  {
    // Find the SmartAccount for this NFT
    (address account, bool isSmartAccount) = _findAccount(contractAddress, tokenId);

    // Transfer to Receiver
    amount = IERC20(assetToken).balanceOf(account);
    IERC20(assetToken).safeTransferFrom(account, receiver, amount);

    // Call "update" on SmartAccount
    if (isSmartAccount) {
      ISmartAccount(payable(account)).handleTokenUpdate(false, assetToken, amount);
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
    nonReentrant
    returns (uint256)
  {
    // Find the SmartAccount for this NFT
    (address account, bool isSmartAccount) = _findAccount(contractAddress, tokenId);

    // Transfer to Receiver
    IERC20(assetToken).safeTransferFrom(account, receiver, assetAmount);

    // Call "update" on SmartAccount
    if (isSmartAccount) {
      ISmartAccount(payable(account)).handleTokenUpdate(false, assetToken, assetAmount);
    }

    return assetAmount;
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Covalent Bonds (Nested NFTs)

  /// @notice Deposit other NFT Assets into the Particle
  ///    Must be called by the account providing the Asset
  ///    Account must Approve THIS contract as Operator of Asset
  ///
  /// @param contractAddress      The Address to the Contract of the Token to Energize
  /// @param tokenId              The ID of the Token to Energize
  /// @param nftTokenAddress      The Address of the NFT Token being deposited
  /// @param nftTokenId           The ID of the NFT Token being deposited
  /// @param nftTokenAmount       The amount of Tokens to Deposit (ERC1155-specific)
  /// @return success             True if the operation succeeded (for backwards-compat)
  function covalentBond(
    address contractAddress,
    uint256 tokenId,
    address nftTokenAddress,
    uint256 nftTokenId,
    uint256 nftTokenAmount
  )
    external
    virtual
    override
    nonReentrant
    returns (bool success)
  {
    // Find the SmartAccount for this NFT
    (address account, bool isSmartAccount) = _createAccount(contractAddress, tokenId);
    ISmartAccount smartAccount = ISmartAccount(payable(account));
    IERC6551Executable execAccount = IERC6551Executable(account);

    // Transfer to SmartAccount and pre-approve Charged Particles to transfer back out
    if (nftTokenAddress.isERC1155()) {
      IERC1155(nftTokenAddress).safeTransferFrom(msg.sender, account, tokenId, nftTokenAmount, "");
      execAccount.execute(nftTokenAddress, 0, abi.encodeWithSelector(IERC1155.setApprovalForAll.selector, address(this), true), 0);
    } else {
      IERC721(nftTokenAddress).safeTransferFrom(msg.sender, account, nftTokenId);
      execAccount.execute(nftTokenAddress, 0, abi.encodeWithSelector(IERC721.setApprovalForAll.selector, address(this), true), 0);
    }

    // Call "update" on SmartAccount
    if (isSmartAccount) {
      smartAccount.handleNFTUpdate(true, nftTokenAddress, nftTokenId, nftTokenAmount);
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
  /// @return success             True if the operation succeeded (for backwards-compat)
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
    nonReentrant
    returns (bool success)
  {
    // Find the SmartAccount for this NFT
    (address account, bool isSmartAccount) = _findAccount(contractAddress, tokenId);

    // Transfer to Receiver
    if (nftTokenAddress.isERC1155()) {
      IERC1155(nftTokenAddress).safeTransferFrom(account, receiver, tokenId, nftTokenAmount, "");
    } else {
      IERC721(nftTokenAddress).safeTransferFrom(account, receiver, nftTokenId);
    }

    // Call "update" on SmartAccount
    if (isSmartAccount) {
      ISmartAccount(payable(account)).handleNFTUpdate(false, nftTokenAddress, nftTokenId, nftTokenAmount);
    }

    return true;
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // ERC6551 Wallet Registry

  /// @dev ...
  function getCurrentRegistry() external view returns (address) {
    return erc6551registry[defaultRegistry];
  }

  /// @dev ...
  function getRegistry(uint256 registry) external view returns (address) {
    return erc6551registry[registry];
  }

  /// @dev ...
  function setRegistry(uint256 version, address registry) external onlyOwner {
    erc6551registry[version] = registry;
  }

  /// @dev ...
  function setDefaultRegistryVersion(uint256 version) external onlyOwner {
    defaultRegistry = version;
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // SmartAccount Execution Controllers
  //  - any NFT contract can have its own custom execution controller

  /// @dev ...
  function setDefaultExecutionController(address executionController) public virtual onlyOwner {
    defaultExecutionController = executionController;
  }

  /// @dev ...
  function setCustomExecutionController(address nftContract, address executionController) public virtual onlyOwner {
    executionControllers[nftContract] = executionController;
  }

  /// @dev ...
  function getExecutionController(address nftContract) public view returns (address executionController) {
    executionController = executionControllers[nftContract];
    if (executionController == address(0)) {
      executionController = defaultExecutionController;
    }
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // SmartAccount BytecodeHash
  //  - any NFT contract can have its own custom execution controller

  /// @dev ...
  function setDefaultAccountBytecodeHash(bytes32 accountBytecodeHash) public virtual onlyOwner {
    defaultAccountBytecodeHash = accountBytecodeHash;
  }

  /// @dev ...
  function setCustomAccountBytecodeHash(address nftContract, bytes32 accountBytecodeHash) public virtual onlyOwner {
    accountHashes[nftContract] = accountBytecodeHash;
  }

  /// @dev ...
  function getAccountBytecodeHash(address nftContract) public view returns (bytes32 accountBytecodeHash) {
    accountBytecodeHash = accountHashes[nftContract];
    if (accountBytecodeHash == bytes32(0) || accountBytecodeHash.length == 0) {
      accountBytecodeHash = defaultAccountBytecodeHash;
    }
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Private Functions

  /// @dev ...
  function _createAccount(
    address contractAddress,
    uint256 tokenId
  ) internal returns (address account, bool isSmartAccount) {
    // Create the SmartAccount for this NFT
    IERC6551zkSyncRegistry registry = IERC6551zkSyncRegistry(erc6551registry[defaultRegistry]);
    bytes32 accountHash = getAccountBytecodeHash(contractAddress);
    account = registry.createAccount(accountHash, defaultSalt, block.chainid, contractAddress, tokenId);
    isSmartAccount = IERC165(account).supportsInterface(type(ISmartAccount).interfaceId);
    ISmartAccount smartAccount = ISmartAccount(payable(account));

    // Store account address
    uint256 uuid = contractAddress.getTokenUUID(tokenId);
    if (nftSmartAccounts[uuid] == address(0)) {
      nftSmartAccounts[uuid] = account;
    }

    // Initialize the Account
    if (isSmartAccount && !smartAccount.isInitialized()) {
      address executionController = getExecutionController(contractAddress);
      smartAccount.initialize(address(this), executionController, block.chainid, contractAddress, tokenId);
    }
  }

  /// @dev ...
  function _findAccount(
    address contractAddress,
    uint256 tokenId
  ) internal view returns (address account, bool isSmartAccount) {
    // Find the SmartAccount for this NFT
    uint256 uuid = contractAddress.getTokenUUID(tokenId);
    account = nftSmartAccounts[uuid];
    isSmartAccount = IERC165(account).supportsInterface(type(ISmartAccount).interfaceId);
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Internal Modifiers

  modifier onlyNFTOwnerOrOperator(address contractAddress, uint256 tokenId) {
    require(contractAddress.isNFTOwnerOrOperator(tokenId, msg.sender), "Invalid owner or operator");
    _;
  }
}
