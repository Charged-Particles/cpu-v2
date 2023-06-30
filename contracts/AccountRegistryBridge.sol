// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./interfaces/IRegistry.sol";
contract AccountRegistryBridge {
    address public constant REGISTRY = 0x2D25602551487C3f3354dD80D76D54383A243358;
    address public constant IMPLMENTATION = 0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d;

    function createAccount(address contractAddress, uint256 tokenId)
        external
        returns (address)
    {
        return IRegistry(REGISTRY).createAccount(
            IMPLMENTATION,
            block.chainid,
            contractAddress,
            tokenId,
            0,
            ''
        );
    }

    function account(address contractAddress, uint256 tokenId)
        external
        view
        returns (address)
    {
        return IRegistry(REGISTRY).account(
            IMPLMENTATION,
            block.chainid,
            contractAddress,
            tokenId,
            0
        );
    }
}