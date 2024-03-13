pragma solidity 0.6.12;
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../tokens/Ionx.sol";
import "../tokens/Lepton2.sol";

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

    Lepton2 public lepton;
    Ionx public ionx;

    uint256 ionxPerLepton;

    constructor(address _lepton, address _ionx) public {
        lepton = Lepton2(_lepton);
        ionx = Ionx(_ionx);
    }

    function load(uint256 amount) external payable override onlyOwner {
        lepton.batchMintLepton{ value: msg.value }(amount);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function setLepton(address _lepton) external override onlyOwner {
        lepton = Lepton2(_lepton);
    }

    function setIonx(address _ionx) external onlyOwner {
        require(_ionx != address(0), "Invalid address");
        ionx = Ionx(_ionx);
    }

    function setIonxPerLepton(uint256 ionxAmount) external onlyOwner {
        ionxPerLepton = ionxAmount;
    }

    function buyWithIonx(
        uint256 leptonAmount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
      uint256 ionxAmount = leptonAmount * ionxPerLepton;
      require(ionx.balanceOf(msg.sender) >= ionxAmount, "Insufficient IONX balance");

      // IONX Approval (requires signtaure)
      ionx.permit(msg.sender, address(this), leptonAmount, deadline, v, r, s);

      // Payment
      ionx.transferFrom(msg.sender, address(this), ionxAmount);

      // Transfer Lepton to Buyer
      uint256 tokenId =  1;
      lepton.safeTransferFrom(address(this), msg.sender, tokenId);

      // TODO: Emit purchase event
    }
}