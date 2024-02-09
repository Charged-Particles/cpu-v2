// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC6551zkSyncRegistry} from "./interfaces/IERC6551zkSyncRegistry.sol";

import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";
import "@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol";


contract ERC6551zkSyncRegistry is IERC6551zkSyncRegistry {
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

      emit ERC6551AccountCreated(newAccount, bytecodeHash, salt, chainId, tokenContract, tokenId);

      accountAddress = abi.decode(returnData, (address));
    } else {
      accountAddress = newAccount;
    }
  }

  // NOTE: This function is NOT a "view" function.
  //
  // Compute this off-chain via:
  //
  //  import { ethers } from "ethers";
  //  import { utils } from "zksync-ethers";
  //  const salt = ethers.encodeBytes32String('');
  //  const input = ethers.encodeBytes32String('');
  //  const nftContractAddress = ethers.ZeroAddress; // OR the NFT Contract Address the SmartAccount is being computed for.
  //  const smartAccountHash = await chargedParticlesContract.getAccountBytecodeHash(nftContractAddress);
  //  const newAccountAddress = utils.create2Address(
  //    __User_Address__,
  //    smartAccountHash,
  //    salt,
  //    input,
  //  );
  //
  function account(
    bytes32 bytecodeHash,
    bytes32 salt,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId
  ) public returns (address accountAddress) {
    bytes memory zeroBytes;
    (bool success, bytes memory returnData) = SystemContractsCaller
      .systemCallWithReturndata(
        uint32(gasleft()),
        address(DEPLOYER_SYSTEM_CONTRACT),
        uint128(0),
        abi.encodeCall(
          DEPLOYER_SYSTEM_CONTRACT.getNewAddressCreate2,
          (msg.sender, bytecodeHash, salt, zeroBytes)
        )
      );
    if (!success) { revert AccountComputeFailed(); }

    accountAddress = abi.decode(returnData, (address));
  }
}
