// SPDX-License-Identifier: MIT
// Written by: Rob Secord (https://twitter.com/robsecord)
// Co-founder @ Charged Particles - Visit: https://charged.fi
// Co-founder @ Taggr             - Visit: https://taggr.io

pragma solidity 0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
// import {BitMaps} from "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import {ERC721, ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IDynamicTraits} from "../interfaces/IDynamicTraits.sol";

/**
 * @dev todo...
 */
contract CustomizableNFT is IDynamicTraits, Ownable, ERC721Enumerable {
  // using BitMaps for uint256;

  uint256 internal _totalTokens;
  string internal _tokenUri;
  // mapping (uint256 => BitMaps.BitMap) internal _traitBits;
  mapping (uint256 => uint256) internal _traitBits;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable() {}

  function getTraits(uint256 tokenId) external view override returns (uint256) {
    return _traitBits[tokenId];
  }

  function hasTrait(uint256 tokenId, uint256 trait) external view override returns (bool) {
    uint256 bit = _traitBits[tokenId] & (1 << trait);
    return bit > 0;
  }

  function traitCount(uint256 tokenId) external view returns (uint256 totalTraits) {
    uint256 map = _traitBits[tokenId];
    // Brian Kerninghan bit-counting method = O(log(n))
    while (map != 0) {
      map &= (map - 1);
      totalTraits += 1;
    }
  }

  function addTraits(uint256 tokenId, uint256 traits) external override returns (uint256) {
    _traitBits[tokenId] |= traits;
    return _traitBits[tokenId];
  }

  function removeTraits(uint256 tokenId, uint256 traits) external override returns (uint256) {
    uint256 mask = traits ^ (2 ** 256 - 1); // negate to find the traits to keep
    _traitBits[tokenId] &= mask;
    return _traitBits[tokenId];
  }

  function mint() external virtual returns (uint256 tokenId) {
    _totalTokens += 1;
    tokenId = _totalTokens;
    _safeMint(_msgSender(), tokenId);
  }

  /**
    * @dev Set Base URI for Metadata - Only Owner
    */
  function setBaseURI(string memory newBase) external onlyOwner {
    _tokenUri = newBase;
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return _tokenUri;
  }
}
