import { ethers, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer } = await getNamedAccounts();
  const receiver = '0x03828b7129d49313b2cdc966e50369b75ec79a48';
  const chargedParticlesAddress = '0xaB1a1410EA40930755C1330Cc0fB3367897C8c41';

  // const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', '0x51f845af34c60499a1056FCDf47BcBC681A0fA39');
  const manager = await ethers.getContractAt('AaveWalletManager', '0x54b32b288d7904D5d98Be1910975a80e45DA5e8d');

  const setControllerTxBefore = await manager.setController(deployer).then(tx => tx.wait());

  const dischargeInterface = (recipient: string, amount: BigInt) => {
    const ABI = ["function transfer(address recipient, uint256 amount)"];
    const iface = new ethers.Interface(ABI);
    const cdata = iface.encodeFunctionData("transfer", [recipient, amount]); 

    return cdata;
  };

  const amountDeposit = 164n;
  const dischargeCallData = dischargeInterface(receiver, amountDeposit); 

  const executeTx = await manager.executeForAccount(
    '0xcaf6e5465c410c187bd6Abb25Ae8c0221881086B', //ProtonC
    103, //Token ID
    '0x1E6bb68Acec8fefBD87D192bE09bb274170a0548', //Asset
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