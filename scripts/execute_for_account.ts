import { ethers, getNamedAccounts } from "hardhat";
import { ChargedParticles } from "../typechain-types";

async function main() {
  const { deployer } = await getNamedAccounts();

  const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', '0x51f845af34c60499a1056FCDf47BcBC681A0fA39');
  const manager = await ethers.getContractAt('AaveWalletManager', '0xa8BaA965C302F748197C25a5217fb5b7c7a8C678');

  const setControllerTx = await manager.setController(deployer).then(tx => tx.wait());

  const dischargeInterface = (recipient: string, amount: BigInt) => {
    const ABI = ["function transfer(address recipient, uint256 amount)"];
    const iface = new ethers.Interface(ABI);
    const cdata = iface.encodeFunctionData("transfer", [recipient, amount]); 

    return cdata;
  };

  const amountDeposit = 94n;
  const dischargeCallData = dischargeInterface(deployer, amountDeposit); 

  const executeTx = await manager.executeForAccount(
    '0x63174FA9680C674a5580f7d747832B2a2133Ad8f', //ProtonC
    103, //Token ID
    '0xcaf6e5465c410c187bd6Abb25Ae8c0221881086B', //Asset
    0,
    dischargeCallData
  ).then(tx => tx.wait());

  console.log(executeTx)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});