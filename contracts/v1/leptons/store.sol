pragma solidity 0.6.12;
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/*
    TODO: 
        1. OnlyOwner
        2. Buy with Ionx method
        3. Can receive NFTs
        4. wormhole prevention
*/

interface ILepsonsStore {
   function load(uint256 amount, uint256 price) external payable;
}

contract LeptonStore is ILepsonsStore, IERC721Receiver  {
    function load(uint256 amount, uint256 price) external payable override {
    }


    function onERC721Received(address, address, uint256, bytes calldata) external override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}