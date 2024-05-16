// SPDX-License-Identifier: MIT

// ISmartAccount.sol -- Part of the Charged Particles Protocol
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

import {IERC6551Account} from "../interfaces/IERC6551Account.sol";
import {IERC6551Executable} from "../interfaces/IERC6551Executable.sol";

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

/**
 * @title A smart contract account owned by a single ERC721 token
 */
interface ISmartAccount is
  IERC165,
  IERC6551Account,
  IERC6551Executable,
  IERC721Receiver,
  IERC1155Receiver
{
  event PermissionUpdated(address owner, address caller, bool hasPermission);
  event ExecutionControllerUpdated(address owner, address controller);

  function isInitialized() external returns (bool);
  function initialize(
    address chargedParticles,
    address executionController,
    uint256 parentNftChainId,
    address parentNftContract,
    uint256 parentNftTokenId
  ) external;

  function getPrincipal(address assetToken) external view returns (uint256 total);
  function getInterest(address assetToken) external view returns (uint256 total);
  function getRewards(address assetToken) external view returns (uint256 total);
  function getCovalentBonds(address nftContractAddress, uint256 nftTokenId) external view returns (uint256 total);

  function handleTokenUpdate(
    bool isReceiving,
    address assetToken,
    uint256 assetAmount
  ) external;

  function handleNFTUpdate(
    bool isReceiving,
    address tokenContract,
    uint256 tokenId,
    uint256 tokenAmount
  ) external;

  function handleNFTBatchUpdate(
    bool isReceiving,
    address tokenContract,
    uint256[] calldata tokenIds,
    uint256[] calldata tokenAmounts
  ) external;
}