import { ethers, network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { parseEther as toWei } from 'ethers';
import { Lepton2 } from '../typechain-types';

interface LeptonType {
  tokenUri: string;
  price: { [key: number]: bigint };
  supply: { [key: number]: bigint };
  multiplier: bigint;
  bonus: bigint;
}

export const leptonConfig = {
  maxMintPerTx: 25n,
  types: [
    {
      name        : 'Electron Neutrino',
      tokenUri    : 'https://gateway.pinata.cloud/ipfs/QmcWuHx4MgywyEMzsqT9J3boJu1gk7GdtAMQ1pyQYRR3XS',
      price       : {1: toWei('0.3'), 42: toWei('0.0000003'), 31337: toWei('0.000000003')},
      supply      : {1: 721n,  42: 40n,         31337: 40n},
      multiplier  : 110n,  // 1.1%
      bonus       : 0n,
    },
    {
      name        : 'Muon Neutrino',
      tokenUri    : 'https://gateway.pinata.cloud/ipfs/QmccGhGhvi37QScB4u2VmuVwENtEsMpx6hAKUqu3x3nU9V',
      price       : {1: toWei('0.9'), 42: toWei('0.0000009'), 31337: toWei('0.000000009')},
      supply      : {1: 401n,  42: 20n,         31337: 20n},
      multiplier  : 130n,  // 1.3%
      bonus       : 1n,
    },
    {
      name        : 'Tau Neutrino',
      tokenUri    : 'https://gateway.pinata.cloud/ipfs/Qma2ZPnCM95AYZ1wPxZdDVvRiS114Svrw2J632ZpLiX7JV',
      price       : {1: toWei('1.7'), 42: toWei('0.0000017'), 31337: toWei('0.000000017')},
      supply      : {1: 301n,  42: 12n,         31337: 12n},
      multiplier  : 150n,  // 1.5%
      bonus       : 2n,
    },
    {
      name        : 'Electron',
      tokenUri    : 'https://gateway.pinata.cloud/ipfs/QmNRKJsUwqEE9zYK6sEND8HDGa4cHFkkC2ntjQA5bFL6jJ',
      price       : {1: toWei('2.9'), 42: toWei('0.000029'), 31337: toWei('0.00000029')},
      supply      : {1: 201n,  42: 8n,          31337: 8n},
      multiplier  : 180n,  // 1.8%
      bonus       : 4n,
    },
    {
      name        : 'Muon',
      tokenUri    : 'https://gateway.pinata.cloud/ipfs/QmWiH5F9yPp7yRzcqocmQKuhrA3KVY9fGJZxD9UKBDu5wr',
      price       : {1: toWei('5.1'), 42: toWei('0.000051'), 31337: toWei('0.00000051')},
      supply      : {1: 88n,   42: 5n,         31337: 5n},
      multiplier  : 230n,  // 2.3%
      bonus       : 8n,
    },
    {
      name        : 'Tau',
      tokenUri    : 'https://gateway.pinata.cloud/ipfs/QmUkCXgyguBSxnGRtfBAvofAkyhFbRCwS7HPaoytAZvemt',
      price       : {1: toWei('21'), 42: toWei('0.00021'), 31337: toWei('0.0000021')},
      supply      : {1: 21n,  42: 2n,        31337: 2n},
      multiplier  : 510n,  // 5.1%
      bonus       : 16n,
    },
  ]
}

const Lepton2: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

	await deploy('Lepton2', {
		from: deployer,
		args: [],
		log: true,
	});

  const lepton2: Lepton2 = await ethers.getContract('Lepton2');
  await lepton2.setMaxMintPerTx(leptonConfig.maxMintPerTx).then(tx => tx.wait());

  // mint
  let chainId = network.config.chainId ?? 1;
  if (chainId === 5) { chainId = 42; }
  else if (chainId === 80001) { chainId = 42; }
  else if (chainId === 137) { chainId = 1; }

  for (const leptonKey in leptonConfig.types) {
    const lepton: LeptonType = leptonConfig.types[leptonKey];

    await lepton2.addLeptonType(
      lepton.tokenUri,
      lepton.price[chainId],
      lepton.supply[chainId],
      lepton.multiplier,
      lepton.bonus,
    )
  }

  await lepton2.setPausedState(false).then(tx => tx.wait());
};
export default Lepton2;

Lepton2.tags = ['Lepton2'];