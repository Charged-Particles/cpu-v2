pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../lib/BlackholePrevention.sol";
import "../tokens/Ionx.sol";
import "../tokens/Lepton2.sol";

interface ILepsonsStore {
   function load(uint256 amount) external payable;
   function setLepton(address _lepton) external;
}

contract LeptonsStore is ILepsonsStore, IERC721Receiver, Ownable, BlackholePrevention {
  using SafeMath for uint256;

  event SoldLepton(address indexed buyer, uint256 amount, uint256 price);

  Lepton2 public lepton;
  Ionx public ionx;

  uint256 public nextTokenId;
  uint256 public ionxPerLepton;

  constructor(address _lepton, address _ionx, uint256 _ionxPerLepton) public {
    lepton = Lepton2(_lepton);
    ionx = Ionx(_ionx);
    ionxPerLepton = _ionxPerLepton;
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

    ionx.permit(msg.sender, address(this), ionxAmount, deadline, v, r, s);
    ionx.transferFrom(msg.sender, address(this), ionxAmount);

    for (uint256 i = 0; i < leptonAmount; ++i) {
      uint256 tokenId = nextTokenId;
      nextTokenId = nextTokenId.add(1);

      lepton.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    emit SoldLepton(msg.sender, leptonAmount, ionxAmount);
  }

  function onERC721Received(address, address, uint256, bytes calldata) external override returns (bytes4) {
    return IERC721Receiver.onERC721Received.selector;
  }

  /***********************************|
  |          Only Admin/DAO           |
  |__________________________________*/

  function load(uint256 amount) external payable override onlyOwner {
    require(lepton.balanceOf(address(this)) == 0, "store not empty");
    nextTokenId =  lepton.totalSupply().add(1);
    lepton.batchMintLepton{ value: msg.value }(amount);
  }

  function setLepton(address _lepton) external override onlyOwner {
    require(_lepton != address(0), "Invalid address");
    lepton = Lepton2(_lepton);
  }

  function setIonx(address _ionx) external onlyOwner {
    require(_ionx != address(0), "Invalid address");
    ionx = Ionx(_ionx);
  }

  function setIonxPerLepton(uint256 ionxAmount) external onlyOwner {
    ionxPerLepton = ionxAmount;
  }

  /***********************************|
  |          Only Admin/DAO           |
  |      (blackhole prevention)       |
  |__________________________________*/

  function withdrawEther(address payable receiver, uint256 amount) external onlyOwner {
    _withdrawEther(receiver, amount);
  }

  function withdrawErc20(address payable receiver, address tokenAddress, uint256 amount) external onlyOwner {
    _withdrawERC20(receiver, tokenAddress, amount);
  }

  function withdrawERC721(address payable receiver, address tokenAddress, uint256 tokenId) external onlyOwner {
    _withdrawERC721(receiver, tokenAddress, tokenId);
  }

  function withdrawERC1155(address payable receiver, address tokenAddress, uint256 tokenId, uint256 amount) external onlyOwner {
    _withdrawERC1155(receiver, tokenAddress, tokenId, amount);
  }
}