
import { Contract, ethers } from "ethers";
import { utils } from "zksync-ethers";

const defaultSalt = ethers.encodeBytes32String('CPU-V2');

export const calculateAccountAddress = async (
  chargedParticles: Contract,
  registryAddress: string,
  nftContractAddress: string,
  nftTokenId: number,
  chainId: bigint
) => {
  const abi = ethers.AbiCoder.defaultAbiCoder();
  const inputEncoded = abi.encode(['uint256', 'address', 'uint256'], [chainId, nftContractAddress, nftTokenId]);
  const smartAccountHash = await chargedParticles.getAccountBytecodeHash(nftContractAddress);
  const newAccountAddress = utils.create2Address(
    registryAddress,
    smartAccountHash,
    defaultSalt,
    inputEncoded,
  );
  return newAccountAddress;
};
