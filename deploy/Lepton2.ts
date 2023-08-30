import { ethers, network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { parseEther as toWei } from 'ethers';
import { Lepton2 } from '../typechain-types';
import { isTestnet } from '../utils/isTestnet';
import { addressBook } from '../utils/globals';

interface LeptonType {
  tokenUri: string;
  price: { [key: string]: bigint };
  supply: { [key: string]: bigint };
  multiplier: bigint;
  bonus: bigint;
}

export const leptonConfig = {
  maxMintPerTx: 25n,
  types: [
    {
      name        : 'Electron Neutrino',
      tokenUri    : 'https://gateway.pinata.cloud/ipfs/QmcWuHx4MgywyEMzsqT9J3boJu1gk7GdtAMQ1pyQYRR3XS',
      price       : {live: toWei('0.3'), test: toWei('0.000000003')},
      supply      : {live: 721n,         test: 40n},
      multiplier  : 110n,  // 1.1%
      bonus       : 0n,
    },
    {
      name        : 'Muon Neutrino',
      tokenUri    : 'https://gateway.pinata.cloud/ipfs/QmccGhGhvi37QScB4u2VmuVwENtEsMpx6hAKUqu3x3nU9V',
      price       : {live: toWei('0.9'), test: toWei('0.000000009')},
      supply      : {live: 401n,         test: 20n},
      multiplier  : 130n,  // 1.3%
      bonus       : 1n,
    },
    {
      name        : 'Tau Neutrino',
      tokenUri    : 'https://gateway.pinata.cloud/ipfs/Qma2ZPnCM95AYZ1wPxZdDVvRiS114Svrw2J632ZpLiX7JV',
      price       : {live: toWei('1.7'), test: toWei('0.000000017')},
      supply      : {live: 301n,         test: 12n},
      multiplier  : 150n,  // 1.5%
      bonus       : 2n,
    },
    {
      name        : 'Electron',
      tokenUri    : 'https://gateway.pinata.cloud/ipfs/QmNRKJsUwqEE9zYK6sEND8HDGa4cHFkkC2ntjQA5bFL6jJ',
      price       : {live: toWei('2.9'), test: toWei('0.00000029')},
      supply      : {live: 201n,         test: 8n},
      multiplier  : 180n,  // 1.8%
      bonus       : 4n,
    },
    {
      name        : 'Muon',
      tokenUri    : 'https://gateway.pinata.cloud/ipfs/QmWiH5F9yPp7yRzcqocmQKuhrA3KVY9fGJZxD9UKBDu5wr',
      price       : {live: toWei('5.1'), test: toWei('0.00000051')},
      supply      : {live: 88n,          test: 5n},
      multiplier  : 230n,  // 2.3%
      bonus       : 8n,
    },
    {
      name        : 'Tau',
      tokenUri    : 'https://gateway.pinata.cloud/ipfs/QmUkCXgyguBSxnGRtfBAvofAkyhFbRCwS7HPaoytAZvemt',
      price       : {live: toWei('21'), test: toWei('0.0000021')},
      supply      : {live: 21n,         test: 2n},
      multiplier  : 510n,  // 5.1%
      bonus       : 16n,
    },
  ]
}

const Lepton2: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments, getNamedAccounts, network } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId ?? 1;

  // Check for Previously Deployed Version
  const leptonAddress = addressBook[chainId].lepton;
  if (leptonAddress.length < 1) {
    await deploy('Lepton2', {
      from: deployer,
      args: [],
      log: true,
    });
    console.log(`  - Lepton2 Deployed...`);

    console.log(`  - Setting Max-Mint-Per-Transaction...`);
    const lepton2: Lepton2 = await ethers.getContract('Lepton2');
    await lepton2.setMaxMintPerTx(leptonConfig.maxMintPerTx).then(tx => tx.wait());

    // mint
    const chainType = isTestnet() ? 'test' : 'live';
    for (const leptonKey in leptonConfig.types) {
      const lepton: LeptonType = leptonConfig.types[leptonKey];

      console.log(`  - Adding Lepton Tier ${leptonKey}...`);
      await lepton2.addLeptonType(
        lepton.tokenUri,
        lepton.price[chainType],
        lepton.supply[chainType],
        lepton.multiplier,
        lepton.bonus,
      )
    }

    console.log(`  - Unpausing Lepton Contract...`);
    await lepton2.setPausedState(false).then(tx => tx.wait());
  } else {
    console.log(`  - Using Lepton2 Deployed at ${leptonAddress}`);
  }
};
export default Lepton2;

Lepton2.tags = ['Lepton2'];