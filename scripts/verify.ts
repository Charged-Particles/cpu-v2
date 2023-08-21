import { ethers, run } from 'hardhat';

async function main() {

  const verifyContract = async (contractName: string, contract: any, constructorArguments: any = []) => {
    try {
      const contractAddress = await contract.getAddress();
      console.log(`\nVerifying contract "${contractName}" at address: ${contractAddress}`);
      await run('verify:verify', { address: contractAddress, constructorArguments });
      console.log(`${contractName} Verification Complete!\n`);
    } catch ( err ) {
      console.log(`[ERROR] Failed to Verify ${contractName}`);
      console.log(err);
    }
  };


  // Verify UniverseRP
  await verifyContract('UniverseRP', await ethers.getContract('UniverseRP'));

  // Verify RewardProgramFactory
  await verifyContract('RewardProgramFactory', await ethers.getContract('RewardProgramFactory'));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});