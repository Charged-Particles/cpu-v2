// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./MinimalisticAccount.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ChargedParticlesAccount is MinimalisticAccount {
  function covalentBond(
    address contractAddress,
    uint256 tokenId,
    string calldata basketManagerId,
    address nftTokenAddress,
    uint256 nftTokenId,
    uint256 nftTokenAmount
  ) external returns (bool success) {
    // Check permission

    // Transfer to self
    }
}