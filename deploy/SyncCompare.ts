import { utils, Wallet, Provider, types } from "zksync2-js";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script`);

  const richAddress = '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049';
  const destinationAddress = '0x277BFc4a8dc79a9F194AD4a83468484046FAFD3A';

  // Initialize the wallet.
  // const provider = new Provider(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
  const wallet = new Wallet(process.env.TEST_PK ?? '');

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);
  // Load contract
  const ERC721iArtifact = await deployer.loadArtifact("ERC721i");
  const ERC721AllArtifact = await deployer.loadArtifact("ERC721All");
  const AzukiArtifact = await deployer.loadArtifact("Azuki");

  // Deploy this contract. The returned object will be of a `Contract` type,
  const ERC721iContract = await deployer.deploy(ERC721iArtifact, [
    'zkGrove',
    'zkg',
    'ipfs://QmYu6APMpWqZP9ZV4k1Bvsgr5hz6QPUyVf5m8xxQRj5oTr',
    richAddress,
    10000
  ]);

  const ERC721iCost = await deployer.estimateDeployGas(ERC721iArtifact, [
    'zkGrove',
    'zkg',
    'ipfs://QmYu6APMpWqZP9ZV4k1Bvsgr5hz6QPUyVf5m8xxQRj5oTr',
    richAddress,
    10000
  ]);
  
  const ERC721AllContract = await deployer.deploy(ERC721AllArtifact, [
      'zkGrove',
      'zkg',
      'ipfs://QmYu6APMpWqZP9ZV4k1Bvsgr5hz6QPUyVf5m8xxQRj5oTr',
    ]);

    const ERC721AllCost = await deployer.estimateDeployGas(ERC721AllArtifact, [
        'zkGrove',
        'zkg',
        'ipfs://QmYu6APMpWqZP9ZV4k1Bvsgr5hz6QPUyVf5m8xxQRj5oTr',
      ]);
    
    const AzukiContract = await deployer.deploy(AzukiArtifact, []);
    const AzukiCost = await deployer.estimateDeployGas(AzukiArtifact, []);
    
    // Infinite transfer
  const preMinttx = await ERC721iContract.preMint().then(tx => tx.wait());
  const azukiMintTransaction =  await AzukiContract.mint(1).then(tx => tx.wait());
  const allMintTransaction = await ERC721AllContract.mint().then(tx => tx.wait());
  
  const infiniteTransferTransaction = await ERC721iContract.transferFrom(richAddress, destinationAddress, 1).then(tx => tx.wait());
  const allTransferTrx = await ERC721AllContract.transferFrom(richAddress, destinationAddress, richAddress).then(tx => tx.wait());
  const azukiTransferTrx = await AzukiContract.transferFrom(richAddress, destinationAddress, 0).then(tx => tx.wait());

  const gasCost = 250000000n;
  console.log(
    `712i deploy: ${ERC721iCost} ${gasCost * ERC721iCost}\n`,
    `712i mint: ${preMinttx.gasUsed} ${gasCost * preMinttx.gasUsed}\n`,
    `712i transfer: ${infiniteTransferTransaction.gasUsed}  ${gasCost * infiniteTransferTransaction.gasUsed}\n`,
    `721n deploy: ${ERC721AllCost}  ${gasCost * ERC721AllCost}\n`,
    `721n mint: ${allMintTransaction.gasUsed}  ${gasCost * allMintTransaction.gasUsed}\n`,
    `721n transfer: ${allTransferTrx.gasUsed}  ${gasCost * allTransferTrx.gasUsed}\n`,
    `721A deploy: ${AzukiCost}  ${gasCost * AzukiCost}\n`,
    `721A mint: ${azukiMintTransaction.gasUsed}  ${gasCost * azukiMintTransaction.gasUsed}\n`,
    `721A transfer: ${azukiTransferTrx.gasUsed}  ${gasCost * azukiTransferTrx.gasUsed}\n`,
  );
}
