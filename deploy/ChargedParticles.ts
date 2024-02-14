
import { deployContract } from "../utils/utils";
import DeployRegistry from './ERC6551zkSyncRegistry';
import DeploySmartAccount from './SmartAccount';

export default async function () {
  // For zkSync, we must manually deploy the registry, as well as the SmartAccount contract.
  //  We then need to calculate the "bytecodeHash" for the SmartAccount contract and pass that
  //  to the CPU constructor as well, in order to dynamically create ERC6551 SmartAccounts.

  // Deploy zkSyncRegistry
  const { contract: zkSyncRegistry, address: zkSyncRegistryAddress, bytecodeHash: zkSyncRegistryHash } = await DeployRegistry();
  // console.log(` -- ERC6551zkSyncRegistry Address: ${zkSyncRegistryAddress}`);
  // console.log(` -- ERC6551zkSyncRegistry BytecodeHash: ${zkSyncRegistryHash}`);

  // Deploy SmartAccount
  const { contract: smartAccount, address: smartAccountAddress, bytecodeHash: smartAccountHash, bytecode: smartAccountBytecode } = await DeploySmartAccount();
  // console.log(` -- SmartAccount Address: ${smartAccountAddress}`);
  // console.log(` -- SmartAccount BytecodeHash: ${smartAccountHash}`);

  const constructorArgs = [
    zkSyncRegistryAddress,  // ERC6551zkSyncRegistry - Manual Deploy on zkEVM Chains
    smartAccountHash,       // BytecodeHash for Pre-deployed SmartAccount contract
  ]

  return await deployContract('ChargedParticles', constructorArgs, { bytecodes: [smartAccountBytecode] }); // pass full bytecode for "factory_deps"
}