// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {SmartAccount} from "../SmartAccount.sol";

error AccountLocked();
error ExceedsMaxLockTime();

/**
 * @title A smart contract account owned by a single ERC721 token
 */
contract SmartAccountTimelocks is SmartAccount {
  event LockUpdated(uint256 lockedUntil);

  /// @dev timestamp at which this account will be unlocked.
  /// Attached to "owner" so that the lock is cleared when transferred.
  mapping(address => uint256) public lockedUntil;

  constructor(address chargedParticles, address executionController)
    SmartAccount(chargedParticles, executionController) {}

  /// @dev returns the current lock status of the account as a boolean
  function isLocked() public view returns (bool) {
    return lockedUntil[owner()] > block.timestamp;
  }

  /// @dev executes a low-level call against an account if the caller is authorized to make calls
  function execute(
    address to,
    uint256 value,
    bytes calldata data,
    uint8 operation
  ) public payable virtual override returns (bytes memory) {
    if (isLocked()) {
      revert AccountLocked();
    }
    return super.execute(to, value, data, operation);
  }

  /// @dev grants a given caller execution permissions
  function setPermissions(
    address[] calldata callers,
    bool[] calldata _permissions
  ) public virtual override {
    if (isLocked()) {
      revert AccountLocked();
    }
    return super.setPermissions(callers, _permissions);
  }

  /// @dev locks the account until a certain timestamp
  function lock(uint256 _lockedUntil) external onlyOwner {
    if (_lockedUntil > block.timestamp + 365 days) {
      revert ExceedsMaxLockTime();
    }

    lockedUntil[owner()] = _lockedUntil;

    emit LockUpdated(_lockedUntil);
  }
}
