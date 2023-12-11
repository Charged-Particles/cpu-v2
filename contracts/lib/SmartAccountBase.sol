// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC165, ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

import {IERC6551Account} from "../interfaces/IERC6551Account.sol";
import {ERC6551AccountLib} from "./ERC6551AccountLib.sol";

import {ISmartAccount} from "../interfaces/ISmartAccount.sol";
import {ISmartAccountController} from "../interfaces/ISmartAccountController.sol";

error NotAuthorized();
error InvalidInput();
error OwnershipCycle();

/**
 * @title A smart contract account owned by a single ERC721 token
 */
abstract contract SmartAccountBase is ISmartAccount, ERC165 {
  bytes4 internal constant _MAGIC_VALUE = 0x523e3260;

  uint256 internal _accountState;

  /// @dev mapping from owner => caller => has permissions
  mapping(address => mapping(address => bool)) internal _permissions;

  address internal _executionController;

  constructor(address controller) {
    _executionController = controller;
    _accountState = 1;
  }

  /// @dev allows eth transfers by default, but allows account owner to override
  receive() external payable virtual override {}


  function permissions(address _owner, address caller) external view virtual returns (bool) {
    return _permissions[_owner][caller];
  }

  function executionController() external view virtual returns (address) {
    return _executionController;
  }

  /// @dev Returns the EIP-155 chain ID, token contract address, and token ID for the token that
  /// owns this account.
  function token()
    external
    view
    virtual
    returns (
      uint256 chainId,
      address tokenContract,
      uint256 tokenId
    )
  {
    return ERC6551AccountLib.token();
  }

  /// @dev Returns the owner of the ERC-721 token which owns this account. By default, the owner
  /// of the token has full permissions on the account.
  function owner() public view virtual returns (address) {
    (
      uint256 chainId,
      address tokenContract,
      uint256 tokenId
    ) = ERC6551AccountLib.token();

    if (chainId != block.chainid) { return address(0); }

    return IERC721(tokenContract).ownerOf(tokenId);
  }

  function state() external view virtual returns (uint256) {
    return _accountState;
  }

  /// @dev Returns the authorization status for a given caller
  function isValidSigner(address signer, bytes calldata context) public view virtual returns (bytes4 magicValue) {
    (
      ,
      address tokenContract,
      uint256 tokenId
    ) = ERC6551AccountLib.token();
    address ownerOf = IERC721(tokenContract).ownerOf(tokenId);

    // authorize token owner
    if (signer == ownerOf) { return _MAGIC_VALUE; }

    // authorize caller if owner has granted permissions
    if (_permissions[ownerOf][signer]) { return _MAGIC_VALUE; }

    return 0xffffffff;
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
      interfaceId == type(IERC1155Receiver).interfaceId ||
      interfaceId == type(IERC6551Account).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  /// @dev Allows ERC-721 tokens to be received so long as they do not cause an ownership cycle.
  /// This function can be overriden.
  function onERC721Received(
    address,
    address,
    uint256 receivedTokenId,
    bytes memory
  ) public view virtual override returns (bytes4) {
    (
      uint256 chainId,
      address tokenContract,
      uint256 tokenId
    ) = ERC6551AccountLib.token();

    if (chainId == block.chainid && tokenContract == msg.sender && tokenId == receivedTokenId) {
      revert OwnershipCycle();
    }
    return this.onERC721Received.selector;
  }

  /// @dev Allows ERC-1155 tokens to be received. This function can be overriden.
  function onERC1155Received(
    address,
    address,
    uint256,
    uint256,
    bytes memory
  ) public pure virtual override returns (bytes4) {
    return this.onERC1155Received.selector;
  }

  /// @dev Allows ERC-1155 token batches to be received. This function can be overriden.
  function onERC1155BatchReceived(
    address,
    address,
    uint256[] memory,
    uint256[] memory,
    bytes memory
  ) public pure virtual override returns (bytes4) {
    return this.onERC1155BatchReceived.selector;
  }

  /// @dev Executes a low-level call
  function _call(
    address to,
    uint256 value,
    bytes calldata data
  ) internal returns (bytes memory result) {
    bool success;
    (success, result) = to.call{value: value}(data);

    if (!success) {
      assembly {
        revert(add(result, 32), mload(result))
      }
    } else {
      _accountState += 1;
    }
  }

  /// @dev Executes a low-level static call
  function _callStatic(address to, bytes calldata data)
    internal
    view
    returns (bytes memory result)
  {
    bool success;
    (success, result) = to.staticcall(data);

    if (!success) {
      assembly {
        revert(add(result, 32), mload(result))
      }
    }
  }

  function _onExecute(
    address to,
    uint256 value,
    bytes calldata data,
    uint8 operation
  ) internal {
    if (IERC165(_executionController).supportsInterface(type(ISmartAccountController).interfaceId)) {
      string memory revertReason = ISmartAccountController(_executionController).onExecute(to, value, data, operation);
      if (bytes(revertReason).length > 0) {
        revert(revertReason);
      }
    }
  }

  function _parseFirst4Bytes(bytes calldata _data) internal pure returns (bytes4) {
    return bytes4(_data[:4]);
  }

  /// @dev reverts if caller is not the owner of the account
  modifier onlyOwner() {
    if (msg.sender != owner()) revert NotAuthorized();
    _;
  }

  /// @dev reverts if caller is not authorized to execute on this account
  modifier onlyValidSigner(bytes calldata context) {
    if (isValidSigner(msg.sender, context) != 0x523e3260) revert NotAuthorized();
    _;
  }
}
