import { ethers } from "hardhat";
import { ChargedParticles } from "../typechain-types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addressBook } from "./globals";

export const getChargedParticlesOwner = async (hre: HardhatRuntimeEnvironment) => {
  const { network } = hre;

  const chainId = network.config.chainId ?? 1;
  const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles);
  const chargedParticlesOwner = await chargedParticles.owner();

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [chargedParticlesOwner],
  });

  const chargedParticlesOwnerSigner = await ethers.getSigner(chargedParticlesOwner);
  return chargedParticlesOwnerSigner;
};