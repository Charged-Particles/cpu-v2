// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC165, ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {ISmartAccountController} from "../interfaces/ISmartAccountController.sol";

/**
 * @title A smart contract account owned by a single ERC721 token
 */
contract SmartAccountController_EX1 is ISmartAccountController, ERC165 {
  constructor() {}

  /// @dev mapping from method signature => allowed method call
  mapping(bytes4 => bool) internal _bannedMethods;

  function bannedMethods(bytes4 methodSignature) external view virtual returns (bool) {
    return _bannedMethods[methodSignature];
  }

  function isAllowedMethod(bytes calldata data) external view virtual returns (bool) {
    return _isAllowedMethod(data);
  }

  function _isAllowedMethod(bytes calldata _data) internal view returns (bool) {
    bytes4 signature = bytes4(_data[:4]);
    return _bannedMethods[signature];
  }

  function onExecute(
    address,
    uint256,
    bytes calldata data,
    uint8
  ) external virtual override returns (string memory revertReason) {
    if (!_isAllowedMethod(data)) {
      return "Method call not allowed";
    }
    return "";
  }

  function onReceived(
    address tokenContract,
    uint256 tokenId,
    uint256 tokenAmount,
    bytes calldata data
  ) external {
    // no-op
  }

  function onReceivedBatch(
    address tokenContract,
    uint256[] calldata tokenIds,
    uint256[] calldata tokenAmounts,
    bytes calldata data
  ) external {
    // no-op
  }

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
