// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IERC6551Registry} from "./interfaces/IERC6551Registry.sol";
import {ISmartAccount} from "./interfaces/ISmartAccount.sol";
import {SmartAccount} from "./SmartAccount.sol";

contract ChargedParticles {

  address internal implementation;

  // registry version => address
  mapping (uint256 => address) internal erc6551registry;
  uint256 internal defaultRegistry;

  constructor() {
    implementation = address(new SmartAccount(address(this)));
  }

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

  /// @dev ...
  // function setExecutionController(address controller) external virtual {
  //   _executionController = controller;
  // }

  function energizeParticle(
    address assetToken,
    uint256 assetAmount
  ) external {
    IERC20(assetToken).transferFrom(msg.sender, address(this), assetAmount);
  }

  function dischargeParticle(
    address receiver,
    address assetToken,
    uint256 assetAmount
  ) external {
    IERC20(assetToken).transfer(receiver, assetAmount);
  }

  function covalentBond(
    address parentTokenAddress,
    uint256 parentTokenId,
    address childTokenAddress,
    uint256 childTokenId,
    uint256 /* childTokenAmount */
  ) external {
    // Find the SmartAccount for this NFT
    IERC6551Registry registry = IERC6551Registry(erc6551registry[defaultRegistry]);
    address account = registry.account(implementation, bytes4(0), block.chainid, parentTokenAddress, parentTokenId);   //  "implementation" here would differ between erc6551 versions...

    // bytes4 encodedFn = IERC721(0).safeTransferFrom.selector;

    // Transfer to SmartAccount
    IERC721(childTokenAddress).safeTransferFrom(msg.sender, account, childTokenId);

    // Call "update" on SmartAccount
    if (IERC165(account).supportsInterface(type(ISmartAccount).interfaceId)) {
      ISmartAccount(payable(account)).handleERC721Update(true, childTokenAddress, childTokenId, "");
    }
  }

  function breakCovalentBond(
    address receiver,
    address parentTokenAddress,
    uint256 parentTokenId,
    address childTokenAddress,
    uint256 childTokenId,
    uint256 /* childTokenAmount */
  ) external {
    // Find the SmartAccount for this NFT
    IERC6551Registry registry = IERC6551Registry(erc6551registry[defaultRegistry]);
    address account = registry.account(implementation, bytes4(0), block.chainid, parentTokenAddress, parentTokenId);   //  "implementation" here would differ between erc6551 versions...

    // Transfer to SmartAccount
    IERC721(childTokenAddress).safeTransferFrom(account, receiver, childTokenId);

    // Call "update" on SmartAccount
    if (IERC165(account).supportsInterface(type(ISmartAccount).interfaceId)) {
      ISmartAccount(payable(account)).handleERC721Update(false, childTokenAddress, childTokenId, "");
    }
  }


}
