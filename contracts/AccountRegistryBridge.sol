// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./interfaces/IRegistry.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract AccountRegistryBridge {
    address public constant REGISTRY = 	0x02101dfB77FDE026414827Fdc604ddAF224F0921;
    address public constant IMPLEMENTATION = 0x2D25602551487C3f3354dD80D76D54383A243358;

    function createAccount(
        address contractAddress,
        uint256 tokenId
    ) external returns (address) {
        return IRegistry(REGISTRY).createAccount(
            IMPLEMENTATION,
            block.chainid,
            contractAddress,
            tokenId,
            0,
            ''
        );
    }

    function account(
        address contractAddress,
        uint256 tokenId
    ) external view returns (address) {
        return IRegistry(REGISTRY).account(
            IMPLEMENTATION,
            block.chainid,
            contractAddress,
            tokenId,
            0
        );
    }
}