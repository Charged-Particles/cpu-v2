// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC165, ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import {IERC6551Account} from "../interfaces/IERC6551Account.sol";
import {IERC6551Executable} from "../interfaces/IERC6551Executable.sol";
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
  /// @dev mapping from owner => caller => has permissions
  mapping(address => mapping(address => bool)) internal _permissions;

  address internal _chargedParticles;
  address internal _executionController;

  constructor(address chargedParticles) {
    _chargedParticles = chargedParticles;
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
    public
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
    (uint256 chainId, address tokenContract, uint256 tokenId) = ERC6551AccountLib.token();
    if (chainId != block.chainid) { return address(0); }

    try IERC721(tokenContract).ownerOf(tokenId) returns (address _owner) {
      return _owner;
    } catch {
      return address(0);
    }
  }

  function isValidSigner(address signer, bytes calldata) external view virtual returns (bytes4) {
    if (_isValidSigner(signer)) {
      return IERC6551Account.isValidSigner.selector;
    }
    return bytes4(0);
  }

  function isValidSignature(bytes32 hash, bytes memory signature)
    external
    view
    virtual
    returns (bytes4 magicValue)
  {
    bool isValid = SignatureChecker.isValidSignatureNow(owner(), hash, signature);
    if (isValid) {
      return IERC1271.isValidSignature.selector;
    }
    return bytes4(0);
  }

  /// @dev grants a given caller execution permissions
  function setPermissions(address[] calldata callers, bool[] calldata newPermissions) public virtual {
    address _owner = owner();
    if (msg.sender != _owner) { revert NotAuthorized(); }

    uint256 length = callers.length;
    if (newPermissions.length != length) { revert InvalidInput(); }

    for (uint256 i = 0; i < length; i++) {
      _permissions[_owner][callers[i]] = newPermissions[i];
      emit PermissionUpdated(_owner, callers[i], newPermissions[i]);
    }
  }

  /// @dev ...
  function setExecutionController(address controller) external virtual {
    if (msg.sender != owner() && msg.sender != _chargedParticles) revert NotAuthorized();
    _executionController = controller;
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
    return interfaceId == type(IERC165).interfaceId
      || interfaceId == type(IERC6551Account).interfaceId
      || interfaceId == type(IERC6551Executable).interfaceId;
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
    // solhint-disable-next-line avoid-low-level-calls
    (success, result) = to.call{value: value}(data);

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

  function _onUpdate(
    bool isReceiving,
    address childTokenContract,
    uint256 childTokenId,
    uint256 childTokenAmount,
    bytes calldata data
  ) internal {
    if (IERC165(_executionController).supportsInterface(type(ISmartAccountController).interfaceId)) {
      (, address tokenContract, uint256 tokenId) = ERC6551AccountLib.token();
      ISmartAccountController(_executionController).onUpdate(isReceiving, tokenContract, tokenId, childTokenContract, childTokenId, childTokenAmount, data);
    }
  }

  function _onUpdateBatch(
    bool isReceiving,
    address childTokenContract,
    uint256[] calldata childTokenIds,
    uint256[] calldata childTokenAmounts,
    bytes calldata data
  ) internal {
    if (IERC165(_executionController).supportsInterface(type(ISmartAccountController).interfaceId)) {
      (, address tokenContract, uint256 tokenId) = ERC6551AccountLib.token();
      ISmartAccountController(_executionController).onUpdateBatch(isReceiving, tokenContract, tokenId, childTokenContract, childTokenIds, childTokenAmounts, data);
    }
  }

  function _isValidSigner(address signer) internal view virtual returns (bool) {
    address ownerOf = owner();

    // Charged Particles always has permissions
    if (signer == _chargedParticles) { return true; }

    // authorize caller if owner has granted permissions
    if (_permissions[ownerOf][signer]) { return true; }

    // authorize token owner
    return signer == ownerOf;
  }

  /// @dev reverts if caller is not the owner of the account
  modifier onlyOwner() {
    if (msg.sender != owner()) revert NotAuthorized();
    _;
  }

  /// @dev reverts if caller is not authorized to execute on this account
  modifier onlyValidSigner() {
    if (_isValidSigner(msg.sender)) revert NotAuthorized();
    _;
  }
}
