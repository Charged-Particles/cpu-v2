import { utils, Wallet, Provider, types } from "zksync-web3";
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
  const artifact = await deployer.loadArtifact("ERC721i");

  // Deploy this contract. The returned object will be of a `Contract` type,
  // similar to the ones in `ethers`.
  // `greeting` is an argument for contract constructor.
  const greeterContract = await deployer.deploy(artifact, [
    'ERC721i',
    'i',
    'test/url/',
    deployerAddress,
    100000
  ]);

  // Show the contract info.
  console.log(`${artifact.contractName} was deployed to ${greeterContract.address}`);
}
