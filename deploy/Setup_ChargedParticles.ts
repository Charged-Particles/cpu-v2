
import { performTx } from '../utils/performTx';
import DeployChargedParticles from './ChargedParticles';
import DeploySmartAccountController from './SAC_EX1';


export default async function () {
  // Deploy ChargedParticles (including zkSyncRegistry & SmartAccount)
  const { contract: chargedParticles, address: chargedParticlesAddress, bytecodeHash: chargedParticlesHash } = await DeployChargedParticles();
  console.log(` -- Charged Particles Address: ${chargedParticlesAddress}`);

  // Deploy SmartAccountController_Example1
  const { contract: sac, address: sacAddress, bytecodeHash: sacHash } = await DeploySmartAccountController();
  console.log(` -- Smart Account Controller Address: ${sacAddress}`);

  // Set Default Execution Controller
  await performTx(
    await chargedParticles.setDefaultExecutionController(sacAddress),
    ' -- Default Execution Controller Set for SmartAccounts!'
  );

  return { chargedParticles };
}