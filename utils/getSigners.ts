import { ethers, network } from "hardhat";
import { ChargedParticles } from "../typechain-types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addressBook } from "./globals";

export const getChargedParticlesOwner = async () => {
  const chainId = network.config.chainId ?? 1;
  const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles);
  const chargedParticlesOwner = await chargedParticles.owner();
  const isHardhat = network?.config?.forking?.enabled ?? false;

  if (isHardhat) {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [chargedParticlesOwner],
    });

    const chargedParticlesOwnerSigner = await ethers.getSigner(chargedParticlesOwner);
    return chargedParticlesOwnerSigner;
  } else {
    const chargedParticlesOwnerSigner = await ethers.getSigner(chargedParticlesOwner);
    return chargedParticlesOwnerSigner;
  }
};