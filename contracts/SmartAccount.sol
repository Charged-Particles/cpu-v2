// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ISmartAccountController} from "./interfaces/ISmartAccountController.sol";
import {SmartAccountBase, NotAuthorized, InvalidInput} from "./lib/SmartAccountBase.sol";

/**
 * @title A smart contract account owned by a single ERC721 token
 */
contract SmartAccount is SmartAccountBase {
  constructor(address controller) SmartAccountBase(controller) {}

  /// @dev allows eth transfers by default
  receive() external payable virtual override {}

  /// @dev executes a low-level call against an account if the caller is authorized to make calls
  function execute(
    address to,
    uint256 value,
    bytes calldata data,
    uint8 operation
  )
    public
    payable
    virtual
    override
    onlyValidSigner(data)
    returns (bytes memory)
  {
    _onExecute(to, value, data, operation);

    if (operation == 1) {
      return _call(to, value, data);
    }
    return "";
  }

  /// @dev grants a given caller execution permissions
  function setPermissions(address[] calldata callers, bool[] calldata permissions) public virtual {
    address _owner = owner();
    if (msg.sender != _owner) { revert NotAuthorized(); }

    uint256 length = callers.length;
    if (permissions.length != length) { revert InvalidInput(); }

    for (uint256 i = 0; i < length; i++) {
      _permissions[_owner][callers[i]] = permissions[i];
      emit PermissionUpdated(_owner, callers[i], permissions[i]);
    }
  }

  /// @dev ...
  function setExecutionController(address controller) external virtual onlyOwner {
    _executionController = controller;
  }
}
