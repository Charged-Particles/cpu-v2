// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./interfaces/IChargedParticles.sol";
import "./AccountRegistryBridge.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
contract ChargedParticles is AccountRegistryBridge {
    function energizeParticle(
        address contractAddress,
        uint256 tokenId,
        string calldata walletManagerId,
        address assetToken,
        uint256 assetAmount,
        address referrer
    ) external returns (uint256 yieldTokensAmount) {
        
    }

    function dischargeParticle(
        address receiver,
        address contractAddress,
        uint256 tokenId,
        string calldata walletManagerId,
        address assetToken
    ) external returns (uint256 creatorAmount, uint256 receiverAmount) {

    }

    function dischargeParticleAmount(
        address receiver,
        address contractAddress,
        uint256 tokenId,
        string calldata walletManagerId,
        address assetToken,
        uint256 assetAmount
    ) external returns (uint256 creatorAmount, uint256 receiverAmount) {

    }

    function dischargeParticleForCreator(
        address receiver,
        address contractAddress,
        uint256 tokenId,
        string calldata walletManagerId,
        address assetToken,
        uint256 assetAmount
    ) external returns (uint256 receiverAmount) {

    }

    function releaseParticle(
        address receiver,
        address contractAddress,
        uint256 tokenId,
        string calldata walletManagerId,
        address assetToken
    ) external returns (uint256 creatorAmount, uint256 receiverAmount) {

    }

    function releaseParticleAmount(
        address receiver,
        address contractAddress,
        uint256 tokenId,
        string calldata walletManagerId,
        address assetToken,
        uint256 assetAmount
    ) external returns (uint256 creatorAmount, uint256 receiverAmount) {

    }

    function covalentBond(
        address contractAddress,
        uint256 tokenId,
        string calldata basketManagerId,
        address nftTokenAddress,
        uint256 nftTokenId,
        uint256 nftTokenAmount
    ) external returns (bool success) {
        address tokenBoundAccount = this.account(contractAddress, tokenId); 
        IERC721(nftTokenAddress).safeTransferFrom(msg.sender, tokenBoundAccount, nftTokenId);
    }

    function breakCovalentBond(
        address receiver,
        address contractAddress,
        uint256 tokenId,
        string calldata basketManagerId,
        address nftTokenAddress,
        uint256 nftTokenId,
        uint256 nftTokenAmount
    ) external returns (bool success) {
        address tokenBoundAccount = this.account(contractAddress, tokenId); 
        IERC721(nftTokenAddress).safeTransferFrom(tokenBoundAccount, receiver, nftTokenId);
    }

}
