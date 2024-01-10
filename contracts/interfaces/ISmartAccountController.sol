// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title
 */
interface ISmartAccountController is IERC165 {
  function onExecute(
    address to,
    uint256 value,
    bytes calldata data,
    uint8 operation
  ) external returns (string memory revertReason);

  function onUpdate(
    bool isReceiving,
    address tokenContract,
    uint256 tokenId,
    address receivedTokenContract,
    uint256 receivedTokenId,
    uint256 receivedTokenAmount,
    bytes calldata data
  ) external;

  function onUpdateBatch(
    bool isReceiving,
    address tokenContract,
    uint256 tokenId,
    address receivedTokenContract,
    uint256[] calldata receivedTokenIds,
    uint256[] calldata receivedTokenAmounts,
    bytes calldata data
  ) external;
}
