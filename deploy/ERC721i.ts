import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const ERC721i: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const {deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;

	const { deployer } = await getNamedAccounts();

	await deploy('ERC721i', {
		from: deployer,
		args: ['ERC721i', 'i','test/url/', deployer, 100000],
		log: true,
	});
};
export default ERC721i;

ERC721i.tags = ['ERC721i'];