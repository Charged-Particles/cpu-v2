// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./interfaces/IRegistry.sol";
contract AccountRegistryBridge {
    address public constant REGISTRY = 0x02101dfB77FDE026414827Fdc604ddAF224F0921;
    address public constant IMPLMENTATION = 0xa786cF1e3245C792474c5cc7C23213fa2c111A95;

    function createAccount(uint256 tokenId)
        external
        returns (address)
    {
        return IRegistry(REGISTRY).createAccount(
            IMPLMENTATION,
            block.chainid,
            address(this),
            tokenId,
            0,
            ''
        );
    }

    function account(uint256 tokenId)
        external
        view
        returns (address)
    {
        return IRegistry(REGISTRY).account(
            IMPLMENTATION,
            block.chainid,
            address(this),
            tokenId,
            0
        );
    }
}