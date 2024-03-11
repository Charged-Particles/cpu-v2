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
   function setIonx(address _ionx) external;
   function buyWithIonx(uint256 leptonAmount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external;
}

interface IIonx {
  function permit(address owner, address spender, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external;
  function transfer(address recipient, uint256 amount) external returns (bool);
}

contract LeptonsStore is ILepsonsStore, IERC721Receiver, Ownable  {

    IIonx public ionx;
    ILepton public lepton;
    uint256 ionxPerLepton;

    constructor(address _lepton, address _ionx) public {
        lepton = ILepton(_lepton);
        ionx = IIonx(_ionx);
    }

    function load(uint256 amount) external payable override onlyOwner {
        lepton.batchMintLepton{ value: msg.value }(amount);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function setLepton(address _lepton) external override onlyOwner {
        require(_lepton != address(0), "Invalid address");
        lepton = ILepton(_lepton);
    }

    function setIonx(address _ionx) external override onlyOwner {
        require(_ionx != address(0), "Invalid address");
        ionx = IIonx(_ionx);
    }

    function setIonxPerLepton(uint256 ionxAmount) external override onlyOwner {
        ionxPerLepton = ionxAmount;
    }

    function buyWithIonx(uint256 leptonAmount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external override {
      uint256 ionxAmount = leptonAmount * ionxPerLepton;
      require(ionx.balanceOf(msg.sender) >= ionxAmount, "Insufficient IONX balance");

      // IONX Approval (requires signtaure)
      ionx.permit(msg.sender, address(this), ionxAmount, deadline, v, r, s);

      // Payment
      ionx.transferFrom(msg.sender, address(this), ionxAmount);

      // Transfer Lepton to Buyer
      uint256 tokenId = 123; // TODO: Get Next Token ID
      lepton.safeTransferFrom(address(this), msg.sender, tokenId);

      // TODO: Emit purchase event
    }
}