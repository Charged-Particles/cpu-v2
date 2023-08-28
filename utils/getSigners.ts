import { ethers, network } from "hardhat";
import { ChargedParticles } from "../typechain-types";
import { addressBook } from "./globals";
import { isHardhat } from './isHardhat';

export const getChargedParticlesOwner = async () => {
  const chainId = network.config.chainId ?? 1;
  const chargedParticles: ChargedParticles = await ethers.getContractAt('ChargedParticles', addressBook[chainId].chargedParticles);
  const chargedParticlesOwner = await chargedParticles.owner();

  if (isHardhat()) {
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