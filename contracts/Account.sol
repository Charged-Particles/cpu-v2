// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./interfaces/IERC6551Account.sol";
import "./lib/ERC6551AccountLib.sol";

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";

error NotAuthorized();
error InvalidInput();
error AccountLocked();
error ExceedsMaxLockTime();
error UntrustedImplementation();
error OwnershipCycle();

/**
 * @title A smart contract account owned by a single ERC721 token
 */
contract Account is
    IERC165,
    IERC6551Account,
    IERC721Receiver,
    IERC1155Receiver
{
    /// @dev timestamp at which this account will be unlocked
    uint256 public lockedUntil;

    /// @dev mapping from owner => caller => has permissions
    mapping(address => mapping(address => bool)) public permissions;

    event OverrideUpdated(
        address owner,
        bytes4 selector,
        address implementation
    );

    event PermissionUpdated(address owner, address caller, bool hasPermission);

    event LockUpdated(uint256 lockedUntil);

    /// @dev reverts if caller is not the owner of the account
    modifier onlyOwner() {
        if (msg.sender != owner()) revert NotAuthorized();
        _;
    }

    /// @dev reverts if caller is not authorized to execute on this account
    modifier onlyAuthorized(bytes calldata context) {
        if (isValidSigner(msg.sender, context) != 0x523e3260) revert NotAuthorized();
        _;
    }

    /// @dev reverts if this account is currently locked
    modifier onlyUnlocked() {
        if (isLocked()) revert AccountLocked();
        _;
    }

    modifier onlyAllowedMethod(bytes calldata _data) {
        require(allowedMethod(_data), "Method all not allowed");
        _;
    }

    constructor() {}

    /// @dev allows eth transfers by default, but allows account owner to override
    receive() external payable {
    }

    /// @dev executes a low-level call against an account if the caller is authorized to make calls
    function executeCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external payable onlyAuthorized(data) onlyUnlocked onlyAllowedMethod(data) returns (bytes memory) {
        // emit TransactionExecuted(to, value, data);

        return _call(to, value, data);
    }

    /// @dev grants a given caller execution permissions
    function setPermissions(
        address[] calldata callers,
        bool[] calldata _permissions
    ) external onlyUnlocked {
        address _owner = owner();
        if (msg.sender != _owner) revert NotAuthorized();

        uint256 length = callers.length;

        if (_permissions.length != length) revert InvalidInput();

        for (uint256 i = 0; i < length; i++) {
            permissions[_owner][callers[i]] = _permissions[i];
            emit PermissionUpdated(_owner, callers[i], _permissions[i]);
        }
    }

    /// @dev locks the account until a certain timestamp
    function lock(uint256 _lockedUntil) external onlyOwner onlyUnlocked {
        if (_lockedUntil > block.timestamp + 365 days)
            revert ExceedsMaxLockTime();

        lockedUntil = _lockedUntil;

        emit LockUpdated(_lockedUntil);
    }

    /// @dev returns the current lock status of the account as a boolean
    function isLocked() public view returns (bool) {
        return lockedUntil > block.timestamp;
    }

    /// @dev Returns the EIP-155 chain ID, token contract address, and token ID for the token that
    /// owns this account.
    function token()
        external
        view
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
    function owner() public view returns (address) {
        (
            uint256 chainId,
            address tokenContract,
            uint256 tokenId
        ) = ERC6551AccountLib.token();

        if (chainId != block.chainid) return address(0);

        return IERC721(tokenContract).ownerOf(tokenId);
    }

    /// @dev Returns the authorization status for a given caller
    function isValidSigner(address signer, bytes calldata context) public view returns (bytes4 magicValue) {
        (
            ,
            address tokenContract,
            uint256 tokenId
        ) = ERC6551AccountLib.token();
        address _owner = IERC721(tokenContract).ownerOf(tokenId);

        // authorize token owner
        if (signer == _owner) return 0x523e3260;

        // authorize caller if owner has granted permissions
        if (permissions[_owner][signer]) return 0x523e3260;

        return 0xffffffff;
    }

    /// @dev Returns true if a given interfaceId is supported by this account. This method can be
    /// extended by an override.
    function supportsInterface(bytes4 interfaceId)
        public
        pure 
        override
        returns (bool)
    {
        bool defaultSupport = interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId ||
            interfaceId == type(IERC6551Account).interfaceId;

        if (defaultSupport) return true;

        return false;
    }

    /// @dev Allows ERC-721 tokens to be received so long as they do not cause an ownership cycle.
    /// This function can be overriden.
    function onERC721Received(
        address,
        address,
        uint256 receivedTokenId,
        bytes memory
    ) public view override returns (bytes4) {
        (
            uint256 chainId,
            address tokenContract,
            uint256 tokenId
        ) = ERC6551AccountLib.token();

        if (
            chainId == block.chainid &&
            tokenContract == msg.sender &&
            tokenId == receivedTokenId
        ) revert OwnershipCycle();

        return this.onERC721Received.selector;
    }

    /// @dev Allows ERC-1155 tokens to be received. This function can be overriden.
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    /// @dev Allows ERC-1155 token batches to be received. This function can be overriden.
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public pure override returns (bytes4) {
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

    function allowedMethod(bytes calldata _data) internal returns (bool) {
        bytes4 signature = parseFirst4Bytes(_data);
        //  approve > 0x095ea7b3

        if (signature == 0x095ea7b3) {
            return false;
        }

        return true;
    }

    function parseFirst4Bytes(bytes calldata _data) public pure returns (bytes4) {
        return bytes4(_data[:4]);
    }

    function state() external view returns (uint256) {
        return 1;
    }
}
