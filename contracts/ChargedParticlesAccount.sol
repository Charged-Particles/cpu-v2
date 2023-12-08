// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./SmartAccount.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ChargedParticlesAccount is SmartAccount {

  function energizeParticle(
    address assetToken,
    uint256 assetAmount
  ) external {
    IERC20(assetToken).transferFrom(msg.sender, address(this), assetAmount);
  }

  function dischargeParticle(
    address receiver,
    address assetToken,
    uint256 assetAmount
  ) external {
    IERC20(assetToken).transfer(receiver, assetAmount);
  }

  function covalentBond(
    address nftTokenAddress,
    uint256 nftTokenId,
    uint256 nftTokenAmount
  ) external {
    // Transfer to self
    IERC721(nftTokenAddress).safeTransferFrom(
      msg.sender,
      address(this),
      nftTokenId
    );
  }

  function breakCovalentBond(
    address receiver,
    address nftTokenAddress,
    uint256 nftTokenId,
    uint256 nftTokenAmount
  ) external {
    IERC721(nftTokenAddress).safeTransferFrom(address(this), receiver, nftTokenId);
  }
}
