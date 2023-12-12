import { ethers, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer } = await getNamedAccounts();
  const receiver = '0x03828b7129d49313B2cdc966e50369B75EC79A48';
  const chargedParticlesAddress = '0x0288280Df6221E7e9f23c1BB398c820ae0Aa6c10';

  // const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', '0x51f845af34c60499a1056FCDf47BcBC681A0fA39');
  const manager = await ethers.getContractAt('AaveWalletManager', '0x54b32b288d7904D5d98Be1910975a80e45DA5e8d');

  const setControllerTxBefore = await manager.setController(deployer).then(tx => tx.wait());

  const dischargeInterface = (recipient: string, amount: BigInt) => {
    const ABI = ["function transfer(address recipient, uint256 amount)"];
    const iface = new ethers.Interface(ABI);
    const cdata = iface.encodeFunctionData("transfer", [recipient, amount]); 

    return cdata;
  };

  const amountDeposit = 94n;
  const dischargeCallData = dischargeInterface(receiver, amountDeposit); 

  const executeTx = await manager.executeForAccount(
    '0x63174FA9680C674a5580f7d747832B2a2133Ad8f', //ProtonC
    103, //Token ID
    '0xcaf6e5465c410c187bd6Abb25Ae8c0221881086B', //Asset
    0,
    dischargeCallData
  ).then(tx => tx.wait());

  const setControllerTxAfter = await manager.setController(chargedParticlesAddress).then(tx => tx.wait());

  console.log(executeTx)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});