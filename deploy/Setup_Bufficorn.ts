
import { performTx } from '../utils/performTx';
import SetupChargedParticles from './Setup_ChargedParticles';
import DeployBufficorn from './BufficornZK';


export default async function () {
  // Deploy ChargedParticles (including zkSyncRegistry & SmartAccount)
  const { chargedParticles } = await SetupChargedParticles();

  // Deploy Bufficorn on zkSync
  const { contract: bufficorn, address: bufficornAddress, bytecodeHash: bufficornHash } = await DeployBufficorn();
  // console.log(` -- BufficornZK Address: ${bufficornAddress}`);

  // Set Base Token URI on the BufficornZK contract
  await performTx(
    await bufficorn.setBaseURI('http://www.bufficorn-zk.com/'),
    ' -- Token BaseURI set for BufficornZK'
  );

  // Set Custom Execution Controller as the BufficornZK contract
  await performTx(
    await chargedParticles.setCustomExecutionController(bufficornAddress, bufficornAddress), // NFT Contract, Execution Controller  (in this case, they happen to be the same)
    ' -- Custom Implementation Created for Bufficorn SmartAccounts'
  );
}