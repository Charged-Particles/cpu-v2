pragma solidity 0.6.12;
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ILepton.sol";

/*
    TODO: 
        - Buy with Ionx method
        - wormhole prevention
*/

interface ILepsonsStore {
   function load(uint256 amount) external payable;
   function setLepton(address _lepton) external;
}

contract LeptonsStore is ILepsonsStore, IERC721Receiver, Ownable  {

    ILepton public lepton;

    constructor(address _lepton) public {
        lepton = ILepton(_lepton);
    }

    function load(uint256 amount) external payable override onlyOwner {
        lepton.batchMintLepton{ value: msg.value }(amount);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function setLepton(address _lepton) external override onlyOwner {
        lepton = ILepton(_lepton);
    }
}