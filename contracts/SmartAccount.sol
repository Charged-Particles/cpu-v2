// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
// import {ISmartAccountController} from "./interfaces/ISmartAccountController.sol";
import {SmartAccountBase, NotAuthorized, InvalidInput} from "./lib/SmartAccountBase.sol";

/**
 * @title A smart contract account owned by a single ERC721 token
 */
contract SmartAccount is SmartAccountBase {
  uint256 public state;

  constructor(address chargedParticles) SmartAccountBase(chargedParticles) {}

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
    onlyValidSigner()
    returns (bytes memory)
  {
    require(operation == 0, "Only call operations are supported");
    ++state;

    // Perform custom checks/updates from within a custom controller
    _onExecute(to, value, data, operation);

    // Execute Call on Account
    return _call(to, value, data);
  }

  /// @dev ...
  function handleERC721Update(
    bool isReceiving,
    address tokenContract,
    uint256 tokenId,
    bytes calldata data
  )
    public
    virtual
    override
  {
    // Perform custom checks/updates from within a custom controller
    _onUpdate(isReceiving, tokenContract, tokenId, 1, data);
  }

  function handleERC1155Update(
    bool isReceiving,
    address tokenContract,
    uint256 tokenId,
    uint256 tokenAmount,
    bytes calldata data
  )
    public
    virtual
    override
  {
    // Perform custom checks/updates from within a custom controller
    _onUpdate(isReceiving, tokenContract, tokenId, tokenAmount, data);
  }

  function handleERC1155BatchUpdate(
    bool isReceiving,
    address tokenContract,
    uint256[] calldata tokenIds,
    uint256[] calldata tokenAmounts,
    bytes calldata data
  )
    public
    virtual
    override
  {
    // Perform custom checks/updates from within a custom controller
    _onUpdateBatch(isReceiving, tokenContract, tokenIds, tokenAmounts, data);
  }
}
