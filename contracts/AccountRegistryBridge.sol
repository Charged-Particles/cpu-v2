// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./interfaces/IRegistry.sol";
contract AccountRegistryBridge {
    address public constant REGISTRY = 	0x02101dfB77FDE026414827Fdc604ddAF224F0921;

    function createAccount(
        address implmentation,
        address contractAddress,
        uint256 tokenId
    ) external returns (address) {
        return IRegistry(REGISTRY).createAccount(
            implmentation,
            block.chainid,
            contractAddress,
            tokenId,
            0,
            ''
        );
    }

    function account(
        address implmentation,
        address contractAddress,
        uint256 tokenId
    ) external view returns (address) {
        return IRegistry(REGISTRY).account(
            implmentation,
            block.chainid,
            contractAddress,
            tokenId,
            0
        );
    }
}