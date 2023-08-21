import { ethers, network } from "hardhat";
import { addressBook } from "../../utils/globals";
import { ProtonC } from "../../typechain-types";
import { BigNumberish, EventLog, LogDescription } from "ethers";

const deliveryData = {
  users: [
    '0x277BFc4a8dc79a9F194AD4a83468484046FAFD3A',
  ],
  energizeAmount: 1000
};

const massive = async () => {
  const chainId = network.config.chainId ?? 137;
  const testAddress = '0x48F54e595bf039CF30fa5F768c0b57EAC6508a06';
  const protoncPolygonAddress = '0x59dde2EBe605cD75365F387FFFE82E5203b8E4cd';
  
  const protonC  = await ethers.getContractAt('ProtonC', protoncPolygonAddress) as ProtonC;
  const ionx = await ethers.getContract('Ionx');
  
  const mintProtons = async (userAddress: string) => {
    // const tokenId: BigNumberish = await protonC.callStatic.createBasicProton(
    //   testAddress,
    //   userAddress,
    //   'Testing deploy',
    // );

    const data = await protonC.tokenURI(343);

    // const mintReceipt = await protonC.createProtonForSale(
    //   testAddress,
    //   userAddress,
    //   '',
    //   0,
    //   0,
    //   0,
    // ).then(tx => tx.wait());

    // const logs = mintReceipt?.logs ?? [];

    // for (const log of logs) {
    //   try {
    //     const parsedLog = protonC.interface.parseLog(log as any);
  
    //     if (parsedLog?.name === 'Transfer') {
    //       const tokenId = parsedLog.args.tokenId.toString();
    //       console.log(tokenId);
    //       return tokenId;
    //     }
    //   } catch (error) {
    //     // Log parsing error
    //     console.error('Error parsing log:', error);
    //   }
    // }

    // return tokenId;
  };

  // const energizeNFTs = async (tokenId: BigNumberish) => {
  //   const chargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles);
    
  //   await chargedParticles.energizeParticle(
  //     protoncPolygonAddress,
  //     tokenId,
  //     'generic.B',
  //     await ionx.getAddress(),
  //     1000,
  //     '0x0000000000000000000000000000000000000000'
  //   );
  // };

  for (const user in deliveryData.users) {
    const balance = await mintProtons(user);
    console.log(balance)
  };
}

massive().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});