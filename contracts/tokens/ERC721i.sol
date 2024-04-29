// SPDX-License-Identifier: MIT

// ERC721i.sol -- Part of the Charged Particles Protocol
// Copyright (c) 2024 Firma Lux, Inc. <https://charged.fi>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Written by: Rob Secord (https://twitter.com/robsecord)
// Co-founder @ Charged Particles - Visit: https://charged.fi
// Co-founder @ Taggr             - Visit: https://taggr.io

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../lib/ERC721iEnumerable.sol";

/**
 * @dev This implements a Pre-Mint version of {ERC721} that adds the ability to Pre-Mint
 * all the token ids in the contract and assign an initial owner for each token id.
 *
 * On-chain state for Pre-Mint does not need to be initially stored if Max-Supply is known.
 * Minting is a simple matter of assigning a balance to the pre-mint receiver,
 * and modifying the "read" methods to account for the pre-mint receiver as owner.
 * We use the Consecutive Transfer Method as defined in EIP-2309 to signal inital ownership.
 * Almost everything else remains standard.
 * We also default to the contract "owner" as the pre-mint receiver, but this can be changed.
 */
contract ERC721i is
  Ownable,
  ERC721iEnumerable
{
  /// @dev EIP-2309: https://eips.ethereum.org/EIPS/eip-2309
  event ConsecutiveTransfer(uint256 indexed fromTokenId, uint256 toTokenId, address indexed fromAddress, address indexed toAddress);

  /// @dev ERC721 Base Token URI
  string internal _baseTokenURI;

  /**
    * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection,
    * as well as a `minter` and a `maxSupply` for pre-minting the collection.
    */
  constructor(
    string memory name,
    string memory symbol,
    string memory baseUri,
    address minter,
    uint256 maxSupply
  )
    ERC721(name, symbol)
    Ownable()
  {
    _baseTokenURI = baseUri;
    // Set vars defined in ERC721iEnumerable.sol
    _maxSupply = maxSupply;
    _preMintReceiver = minter;
  }

  /**
    * @dev Pre-mint the max-supply of token IDs to the minter account.
    * Token IDs are in base-1 sequential order.
    */
  function _preMint() internal {
    // Update balance for initial owner, defined in ERC721.sol
    _balances[_preMintReceiver] = _maxSupply;

    // Emit the Consecutive Transfer Event
    emit ConsecutiveTransfer(1, _maxSupply, address(0), _preMintReceiver);
  }

  function preMint() external onlyOwner {
    _preMint();
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }
}
