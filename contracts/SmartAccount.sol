// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {NftTokenInfo} from "./lib/NftTokenInfo.sol";
import {SmartAccountBase, NotAuthorized, InvalidInput} from "./lib/SmartAccountBase.sol";

/**
 * @title A smart contract account owned by a single ERC721 token
 */
contract SmartAccount is SmartAccountBase {
  using NftTokenInfo for address;

  uint256 public state;

  constructor() SmartAccountBase() {}


  /// @dev allows eth transfers by default
  receive() external payable virtual override {}



  function getPrincipal(address assetToken) external view virtual override returns (uint256 total) {
    total = IERC20(assetToken).balanceOf(address(this));
  }

  function getInterest(address /* assetToken */) external view virtual override returns (uint256 total) {
    return 0;
  }

  function getRewards(address /* assetToken */) external view virtual override returns (uint256 total) {
    return 0;
  }

  function getCovalentBonds(address nftContractAddress, uint256 nftTokenId) external view virtual override returns (uint256 total) {
    if (nftContractAddress.isERC1155()) {
      total = IERC1155(nftContractAddress).balanceOf(address(this), nftTokenId);
    } else {
      total = IERC721(nftContractAddress).balanceOf(address(this));
    }
  }



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
    onlyValidSigner
    returns (bytes memory)
  {
    require(operation == 0, "Only call operations are supported");
    ++state;

    // Perform custom checks/updates from within a custom controller
    _onExecute(to, value, data, operation);

    // Execute Call on Account
    return _call(to, value, data);
  }


  function handleTokenUpdate(
    bool isReceiving,
    address assetToken,
    uint256 assetAmount
  )
    public
    virtual
    override
    onlyValidSigner
  {
    // Perform custom checks/updates from within a custom controller
    _onUpdateToken(isReceiving, assetToken, assetAmount);
  }

  function handleNFTUpdate(
    bool isReceiving,
    address tokenContract,
    uint256 tokenId,
    uint256 tokenAmount
  )
    public
    virtual
    override
    onlyValidSigner
  {
    // Perform custom checks/updates from within a custom controller
    _onUpdateNFT(isReceiving, tokenContract, tokenId, tokenAmount);
  }

  function handleNFTBatchUpdate(
    bool isReceiving,
    address tokenContract,
    uint256[] calldata tokenIds,
    uint256[] calldata tokenAmounts
  )
    public
    virtual
    override
    onlyValidSigner
  {
    // Perform custom checks/updates from within a custom controller
    _onUpdateNFTBatch(isReceiving, tokenContract, tokenIds, tokenAmounts);
  }
}
