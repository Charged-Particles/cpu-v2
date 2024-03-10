pragma solidity 0.6.12;
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "../interfaces/ILepton.sol";

/*
    TODO: 
        - OnlyOwner
        - Buy with Ionx method
        - wormhole prevention
        - constructor
        - setLepton

*/

interface ILepsonsStore {
   function load(uint256 amount, uint256 price) external payable;
   function setLepton(address _lepton) external;
}

contract LeptonsStore is ILepsonsStore, IERC721Receiver  {

    address public lepton;

    constructor(address _lepton) public {
        lepton = _lepton;
    }

    function load(uint256 amount, uint256 price) external payable override {
        revert("Method not implemented");
    }

    function onERC721Received(address, address, uint256, bytes calldata) external override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function setLepton(address _lepton) external override {
        lepton = _lepton;
    }
}