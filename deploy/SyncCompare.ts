import { utils, Wallet, Provider, types } from "zksync2-js";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts} = hre;
  console.log(`Running deploy script`);

  const { deployer: deployerAddress } = await getNamedAccounts();

  // Initialize the wallet.
  // const provider = new Provider(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
  const wallet = new Wallet(process.env.MAINNET_PK ?? '');

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);
  // Load contract
  const ERC721iArtifact = await deployer.loadArtifact("ERC721i");
  const ERC721AllArtifact = await deployer.loadArtifact("ERC721All");

  // Deploy this contract. The returned object will be of a `Contract` type,

  const ERC721iContract = await deployer.deploy(ERC721iArtifact, [
    'zkGrove',
    'zkg',
    'ipfs://QmYu6APMpWqZP9ZV4k1Bvsgr5hz6QPUyVf5m8xxQRj5oTr',
    deployerAddress,
    100000
  ]);

    const ERC721AllContract = await deployer.deploy(ERC721AllArtifact, [
    'zkGrove',
    'zkg',
    'ipfs://QmYu6APMpWqZP9ZV4k1Bvsgr5hz6QPUyVf5m8xxQRj5oTr',
  ]);

}
