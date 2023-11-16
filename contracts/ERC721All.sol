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

  function mint() public {
    _mint(msg.sender, uint256(uint160(msg.sender)));
  }

  function tokenURI(uint256 id) public view override returns (string memory) {
    return _baseTokenURI;
  }
}
