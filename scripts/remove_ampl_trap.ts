import { ethers, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer } = await getNamedAccounts();

  

  // aave wallet manager
  // const dischargeInterface = (recipient: string, amount: BigInt) => {
  //   const ABI = ["function transfer(address recipient, uint256 amount)"];
  //   const iface = new ethers.Interface(ABI);
  //   const cdata = iface.encodeFunctionData("transfer", [recipient, amount]); 

  //   return cdata;
  // };

  // const dischargeCallData = dischargeInterface(deployer, amountDeposit); 

  // // Add executor 
  // await aaveManager.setController(deployer).then(tx => tx.wait());
  // const aDAI = await ethers.getContractAt('IERC20Detailed', adaiAddress);
  // const balanceBefore = await aDAI.balanceOf.staticCall(deployer);

  // await aaveManager.executeForAccount(
  //   addressBook[chainId].protonC,
  //   tokenId,
  //   adaiAddress, 
  //   0,
  //   dischargeCallData,
  // ).then(tx => tx.wait());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});