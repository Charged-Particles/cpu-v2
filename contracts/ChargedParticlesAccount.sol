// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./Account.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ChargedParticlesAccount is Account {
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
