import { network } from 'hardhat';

export const isHardhat = () => {
  return network?.config?.forking?.enabled ?? false;
};