// SPDX-License-Identifier: MIT

// ERC6551zkSyncRegistry.sol -- Part of the Charged Particles Protocol
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

import {IERC6551zkSyncRegistry} from "./interfaces/IERC6551zkSyncRegistry.sol";

import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";
import "@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol";

contract ERC6551zkSyncRegistry is IERC6551zkSyncRegistry {
  /**
   * @dev Creates a token bound account for a non-fungible token.
   *
   * If account has already been created, returns the account address without calling create2.
   *
   * Emits ERC6551AccountCreated event.
   *
   * @return account The address of the token bound account
   */
  function createAccount(
    bytes32 bytecodeHash,
    bytes32 salt,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId
  ) external returns (address accountAddress) {
    address newAccount = account(bytecodeHash, salt, chainId, tokenContract, tokenId);
    if (newAccount.code.length == 0) {
      (bool success, bytes memory returnData) = SystemContractsCaller
        .systemCallWithReturndata(
          uint32(gasleft()),
          address(DEPLOYER_SYSTEM_CONTRACT),
          uint128(0),
          abi.encodeCall(
            DEPLOYER_SYSTEM_CONTRACT.create2,
            (salt, bytecodeHash, abi.encode(chainId, tokenContract, tokenId))
          )
        );
      if (!success) { revert AccountCreationFailed(); }

      accountAddress = abi.decode(returnData, (address));

      emit ERC6551AccountCreated(accountAddress, bytecodeHash, salt, chainId, tokenContract, tokenId);
    } else {
      accountAddress = newAccount;
    }
  }

  /**
   * @dev Returns the computed token bound account address for a non-fungible token.
   *
   * @return account The address of the token bound account
   *
   * NOTE: This function is NOT a "view" function.
   *
   * Compute this off-chain via:
   *
   *  import { ethers } from "ethers";
   *  import { utils } from "zksync-ethers";
   *  const abi = ethers.AbiCoder.defaultAbiCoder();
   *  const salt = ethers.encodeBytes32String('CPU-V2');
   *  const input = abi.encode(['uint256', 'address', 'uint256'], [chainId, nftContractAddress, nftTokenId]);
   *  const nftContractAddress = ethers.ZeroAddress;  // OR the NFT Contract Address the SmartAccount is being computed for.
   *  const smartAccountHash = await chargedParticlesContract.getAccountBytecodeHash(nftContractAddress);
   *  const newAccountAddress = utils.create2Address(
   *    __address_of_this_contract_(ERC6551zkSyncRegistry)__,
   *    smartAccountHash,
   *    salt,
   *    input,
   *  );
   */
  function account(
    bytes32 bytecodeHash,
    bytes32 salt,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId
  ) public returns (address accountAddress) {
    (bool success, bytes memory returnData) = SystemContractsCaller
      .systemCallWithReturndata(
        uint32(gasleft()),
        address(DEPLOYER_SYSTEM_CONTRACT),
        uint128(0),
        abi.encodeCall(
          DEPLOYER_SYSTEM_CONTRACT.getNewAddressCreate2,
          (address(this), bytecodeHash, salt, abi.encode(chainId, tokenContract, tokenId))
        )
      );
    if (!success) { revert AccountComputeFailed(); }

    accountAddress = abi.decode(returnData, (address));
  }
}
