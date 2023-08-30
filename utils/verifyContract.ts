import { run } from "hardhat";

export const verifyContract = async (contractName: string, contract: any, constructorArguments: any = []) => {
  try {
    const contractAddress = await contract.getAddress();
    console.log(`  - Verifying contract "${contractName}" at address: ${contractAddress}`);
    await run('verify:verify', { address: contractAddress, constructorArguments });
    console.log(`   -- ${contractName} Verification Complete!\n`);
  } catch ( err ) {
    console.log(`[ERROR] Failed to Verify ${contractName}`);
    console.log(err);
  }
};
