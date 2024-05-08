import { Contract } from 'zksync-ethers';
import { getWallet } from '../utils/utils';
import { performTx } from '../utils/performTx';
import { tokenBaseUri } from '../utils/utils';
import DeployBufficorn from './BufficornZK';

// zkSyncMainnet
import * as ChargedParticlesDeployData from '../deployments-zk/zkSyncMainnet/contracts/ChargedParticles.sol/ChargedParticles.json';


export default async function () {
  const _wallet = getWallet();

  console.log(`Deploying on zkSyncMainnet...`);
  console.log(` -- Charged Particles Address: ${ChargedParticlesDeployData.entries[0].address}`);

  // Load Charged Particles
  const chargedParticles = new Contract(ChargedParticlesDeployData.entries[0].address, ChargedParticlesDeployData.abi, _wallet);

  // Deploy Bufficorn on zkSync
  const { contract: bufficorn, address: bufficornAddress } = await DeployBufficorn();
  console.log(` -- BufficornZK Address: ${bufficornAddress}`);

  // Set Base Token URI on the BufficornZK contract
  await performTx(await bufficorn.setBaseURI(tokenBaseUri.bufficorn), ' -- Token BaseURI set for BufficornZK');

  // Set Custom Execution Controller as the BufficornZK contract
  await performTx(
    await chargedParticles.setCustomExecutionController(bufficornAddress, bufficornAddress), // NFT Contract, Execution Controller  (in this case, they happen to be the same)
    ' -- Custom Implementation Created for Bufficorn SmartAccounts'
  );
}
