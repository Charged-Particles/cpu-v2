// SPDX-License-Identifier: MIT
// Written by: Rob Secord (https://twitter.com/robsecord)
// Co-founder @ Charged Particles - Visit: https://charged.fi
// Co-founder @ Taggr             - Visit: https://taggr.io

pragma solidity 0.8.13;

// import "@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/solady/src/auth/Ownable.sol";

// import "./lib/ERC721.sol";
import "./lib/ERC721Solady.sol";

/**
 * @dev todo...
 */
contract ERC721All is Ownable, ERC721 {
  mapping(uint256 => bool) internal _activeTokens;

  /// @dev ERC721 Base Token URI
  string internal _baseTokenURI;
  string internal _name;
  string internal _symbol;

  constructor(
    string memory name,
    string memory symbol,
    string memory baseUri
  ) ERC721() Ownable() {
    _baseTokenURI = baseUri;
    _symbol = symbol;
    _name = name;
  }

  function name() public view override returns (string memory) {
    return _name;
  }

  function symbol() public view override returns (string memory) {
    return _symbol;
  }

  // function balanceOf(address owner) public view override returns (uint256) {
  //   require(owner != address(0), "ERC721: address zero is not a valid owner");
  //   if (_balances[owner] == 0 && _hasOwnToken(owner)) {
  //     return 1;
  //   }
  //   return _balances[owner];
  // }

  // function ownerOf(uint256 tokenId) public view override returns (address) {
  //   require(_isTokenActive(tokenId), "ERC721: invalid token ID");

  //   // If token has been transfered then _owners will be populated,
  //   // otherwise the token ID represents the initial owner
  //   address owner = _owners[tokenId];
  //   if (owner == address(0)) {
  //     owner = address(uint160(tokenId));
  //   }
  //   return owner;
  // }

  function mint() public {
    _mint(msg.sender, uint256(uint160(msg.sender)));
  }

  // function _mint(address receiver) internal {
  //   // Token ID == Minter Address
  //   uint256 tokenId = uint256(uint160(receiver));

  //   require(receiver != address(0), "ERC721: mint to the zero address");
  //   require(!_isTokenActive(tokenId), "ERC721: token already minted");

  //   // Mark Token as Active
  //   _activeTokens[tokenId] = true;

  //   // Fire Transfer Event
  //   emit Transfer(address(0), receiver, tokenId);
  // }

  // function _hasOwnToken(address owner) internal view returns (bool) {
  //   uint256 ownerTokenId = uint256(uint160(owner));
  //   address currentOwner = _owners[ownerTokenId];
  //   return (_isTokenActive(ownerTokenId) && (currentOwner == owner || currentOwner == address(0)));
  // }

  function tokenURI(uint256 id) public view override returns (string memory) {
    return _baseTokenURI;
  }
}
