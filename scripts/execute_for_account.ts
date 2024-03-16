import { ethers, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer } = await getNamedAccounts();
  const receiver = '0x03828b7129d49313b2cdc966e50369b75ec79a48';
  const chargedParticlesAddress = '0xaB1a1410EA40930755C1330Cc0fB3367897C8c41';

  console.log('deployer = ', deployer);

  // const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', '0x51f845af34c60499a1056FCDf47BcBC681A0fA39');
  const manager = await ethers.getContractAt('AaveWalletManager', '0x54b32b288d7904D5d98Be1910975a80e45DA5e8d');
  console.log(`manager address = `, manager.target);

  const setControllerTxBefore = await manager.setController(deployer).then(tx => tx.wait());
  console.log(`set ctrl tx = `, setControllerTxBefore?.hash);

  const dischargeInterface = (recipient: string, amount: BigInt) => {
    const ABI = ["function transfer(address recipient, uint256 amount)"];
    const iface = new ethers.Interface(ABI);
    const cdata = iface.encodeFunctionData("transfer", [recipient, amount]);

    return cdata;
  };

  const amountDeposit = 164000000000n;
  console.log('amountDeposit = ' + amountDeposit.toString());

  const dischargeCallData = dischargeInterface(receiver, amountDeposit);
  console.log(`dischargeCallData = `, dischargeCallData);

  const executeTx = await manager.executeForAccount(
    '0x63174FA9680C674a5580f7d747832B2a2133Ad8f', //ProtonC
    103, //Token ID
    '0x1E6bb68Acec8fefBD87D192bE09bb274170a0548', //Asset
    0,
    dischargeCallData
  ).then(tx => tx.wait());
  console.log(`execute tx = `, executeTx?.hash);

  const setControllerTxAfter = await manager.setController(chargedParticlesAddress).then(tx => tx.wait());
  console.log(`reset ctrl tx = `, setControllerTxAfter?.hash)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
