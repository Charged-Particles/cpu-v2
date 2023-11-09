import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const ERC721All: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const {deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;

	const { deployer } = await getNamedAccounts();

	await deploy('ERC721All', {
		from: deployer,
		args: ['ERC721 All', 'All'],
		log: true,
	});
};
export default ERC721All;

ERC721All.tags = ['ERC721All'];