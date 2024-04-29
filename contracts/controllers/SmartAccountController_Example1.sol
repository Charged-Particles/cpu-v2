// SPDX-License-Identifier: MIT

// SmartAccount.sol -- Part of the Charged Particles Protocol
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

import {IERC165, ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISmartAccountController} from "../interfaces/ISmartAccountController.sol";

/**
 * @title A SmartAccount Controller which only allows specific methods to be executed on the associated SmartAccount
 */
contract SmartAccountController_Example1 is ISmartAccountController, Ownable, ERC165 {

  /// @dev mapping from method signature => banned method call
  mapping(bytes4 => bool) internal _bannedMethods;


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Initialization
  constructor() Ownable() {}


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Banned Methods Logic

  function bannedMethods(bytes4 methodSignature) external view virtual returns (bool) {
    return _bannedMethods[methodSignature];
  }

  function isAllowedMethod(bytes calldata data) external view virtual returns (bool) {
    return _isAllowedMethod(data);
  }

  function setBannedMethod(bytes4 methodSignature, bool isBanned) external virtual onlyOwner {
    _bannedMethods[methodSignature] = isBanned;
  }

  function _isAllowedMethod(bytes calldata _data) internal view returns (bool) {
    bytes4 signature = bytes4(_data[:4]);
    return !_bannedMethods[signature];
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // SmartAccount Controller Logic

  function onExecute(
    address,
    uint256,
    bytes calldata data,
    uint8
  ) external virtual override returns (string memory revertReason) {
    if (!_isAllowedMethod(data)) {
      revertReason = "Method call not allowed";
    }
    // else success
  }

  function onUpdateToken(
    bool isReceiving,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId,
    address receivedAssetToken,
    uint256 receivedAssetAmount
  )
    external
    virtual
    override
  {
    // perform conditional logic here..
  }

  function onUpdateNFT(
    bool isReceiving,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId,
    address receivedTokenContract,
    uint256 receivedTokenId,
    uint256
  )
    external
    virtual
    override
  {
    // perform conditional logic here..
  }

  function onUpdateNFTBatch(
    bool isReceiving,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId,
    address receivedTokenContract,
    uint256[] calldata receivedTokenIds,
    uint256[] calldata
  )
    external
    virtual
    override
  {
    // perform conditional logic here..
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Interface Identification

  /// @dev Returns true if a given interfaceId is supported by this account. This method can be
  /// extended by an override.
  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(IERC165, ERC165)
    returns (bool)
  {
    return
      interfaceId == type(ISmartAccountController).interfaceId ||
      super.supportsInterface(interfaceId);
  }
}
