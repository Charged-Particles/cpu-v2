// SPDX-License-Identifier: MIT
// Written by: Rob Secord (https://twitter.com/robsecord)
// Co-founder @ Charged Particles - Visit: https://charged.fi
// Co-founder @ Taggr             - Visit: https://taggr.io

pragma solidity 0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {ERC721, ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ISmartAccountController} from "../interfaces/ISmartAccountController.sol";
import {IDynamicTraits} from "../interfaces/IDynamicTraits.sol";

/**
 * @dev todo...
 */
contract CustomizableNFT is ISmartAccountController, IDynamicTraits, Ownable, ERC721Enumerable {
  uint256 internal _totalTokens;
  string internal _tokenUri;
  mapping (uint256 => uint256) internal _traitBits;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable() {}

  //
  // Customizable Traits Logic
  //

  // For minting container-NFTs that have no initial traits
  function mint() external virtual returns (uint256 tokenId) {
    tokenId = _mint(0);
  }

  // For minting child-NFTs that have initial fixed traits
  function mintWithTraits(uint256 traits) external virtual returns (uint256 tokenId) {
    tokenId = _mint(traits);
  }

  function getTraits(uint256 tokenId) external view override returns (uint256) {
    return _traitBits[tokenId];
  }

  function hasTrait(uint256 tokenId, uint256 trait) external view override returns (bool) {
    uint256 bit = _traitBits[tokenId] & (1 << trait);
    return bit > 0;
  }

  function traitCount(uint256 tokenId) external view override returns (uint256 totalTraits) {
    uint256 map = _traitBits[tokenId];
    // Brian Kerninghan bit-counting method = O(log(n))
    while (map != 0) {
      map &= (map - 1);
      totalTraits += 1;
    }
  }

  function _addTraits(uint256 tokenId, uint256 traits) internal returns (uint256) {
    _traitBits[tokenId] |= traits;
    return _traitBits[tokenId];
  }

  function _removeTraits(uint256 tokenId, uint256 traits) internal returns (uint256) {
    uint256 mask = traits ^ (2 ** 256 - 1); // negate to find the traits to keep
    _traitBits[tokenId] &= mask;
    return _traitBits[tokenId];
  }

  //
  // Standard NFT Logic
  //

  /**
    * @dev Set Base URI for Metadata - Only Owner
    */
  function setBaseURI(string memory newBase) external onlyOwner {
    _tokenUri = newBase;
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return _tokenUri;
  }

  function _mint(uint256 traits) internal returns (uint256 tokenId) {
    _totalTokens += 1;
    tokenId = _totalTokens;
    _traitBits[tokenId] |= traits;
    _safeMint(_msgSender(), tokenId);
  }

  //
  // SmartAccount Controller Logic
  //

  function onExecute(
    address,
    uint256,
    bytes calldata,
    uint8
  ) external virtual override returns (string memory revertReason) {
    return ""; // success
  }

  function onUpdate(
    bool isReceiving,
    address tokenContract,
    uint256 tokenId,
    address childTokenContract,
    uint256 childTokenId,
    uint256,
    bytes calldata
  ) external {
    require(tokenContract == address(this), "Invalid source address");

    if (IERC165(childTokenContract).supportsInterface(type(IDynamicTraits).interfaceId)) {
      uint256 newTraits = IDynamicTraits(childTokenContract).getTraits(childTokenId);
      if (isReceiving) {
        _addTraits(tokenId, newTraits);
      } else {
        _removeTraits(tokenId, newTraits);
      }
    }
  }

  function onUpdateBatch(
    bool isReceiving,
    address tokenContract,
    uint256 tokenId,
    address childTokenContract,
    uint256[] calldata childTokenIds,
    uint256[] calldata,
    bytes calldata
  ) external {
    require(tokenContract == address(this), "Invalid source address");

    uint256 i;
    uint256 t;
    uint256 n = childTokenIds.length;
    if (IERC165(childTokenContract).supportsInterface(type(IDynamicTraits).interfaceId)) {
      for (; i < n; i++) {
        t = IDynamicTraits(childTokenContract).getTraits(childTokenIds[i]);
        if (isReceiving) {
          _addTraits(tokenId, t);
        } else {
          _removeTraits(tokenId, t);
        }
      }
    }
  }

  /// @dev Returns true if a given interfaceId is supported by this account. This method can be
  /// extended by an override.
  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(IERC165, ERC721Enumerable)
    returns (bool)
  {
    return
      interfaceId == type(ISmartAccountController).interfaceId ||
      interfaceId == type(IDynamicTraits).interfaceId ||
      super.supportsInterface(interfaceId);
  }
}
