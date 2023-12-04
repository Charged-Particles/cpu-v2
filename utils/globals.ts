
interface StakingToken {
  id: string;
  address: string;
  multiplier: string;
  funding: string;
}

interface AddressBook {
  [chainId: number]: {
    chargedManager: string;
    chargedParticles: string;
    chargedSettings: string;
    tokenInfoProxy: string;
    ionx: string;
    lepton: string;
    protonC: string;
    stakingTokens: Array<StakingToken>;
  };
}

export const addressBook: AddressBook = {
  // Ethereum Mainnet
  1: {
    'chargedManager': '0x7b07Ec627d2426b89C44a6cC75Dc57c27a52174d',
    'chargedParticles': '0xaB1a1410EA40930755C1330Cc0fB3367897C8c41',
    'chargedSettings' : '0x07DdB208d52947320d07E0E4611a80Fb7eFD001D',
    'tokenInfoProxy': '0xeF0D1DEDaAF0D9e4B868a049101a9DB1Ba1e50c5',
    'ionx': '0x02D3A27Ac3f55d5D91Fb0f52759842696a864217',
    'lepton': '0x3Cd2410EAa9c2dCE50aF6CCAb72Dc93879a09c1F',
    'protonC': '0xBb4Ddbc0E26d4E4ae838B12a832379295D5fD917',
    'stakingTokens': [
      // { id: 'DAI',  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', multiplier: '24500', funding: '10000' }, // Deployed
      // { id: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', multiplier: '21750', funding: '10000' }, // Deployed
      // { id: 'LUSD', address: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0', multiplier: '06300', funding: '10000' }, // Not Deployed
      // { id: 'FRAX', address: '0x853d955aCEf822Db058eb8505911ED77F175b99e', multiplier: '31000', funding: '10000' }, // Not Deployed
      { id: 'SUSD', address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51', multiplier: '32500', funding: '10000' }, // Deployed
    ],
  },

  // Polygon Mainnet
  137: {
    'chargedManager': '0x0f42057be75AF6D977a0cE900E732eA4d490B580',
    'chargedParticles': '0x0288280Df6221E7e9f23c1BB398c820ae0Aa6c10',
    'chargedSettings' : '0xdc29C7014d104432B15eD2334e654fCBf3d5E528',
    'tokenInfoProxy': '0x349eEF86Ea34A69D8B880D5Fd5F39a6d2a7DE716',
    'ionx': '0x01b317bC5eD573FAa112eF64DD029F407CecB155',
    'lepton': '0xe349557325164577Ded350A8cAB03159c728B9E7',
    'protonC': '0x59dde2EBe605cD75365F387FFFE82E5203b8E4cd',
    'stakingTokens': [
      { id: 'DAI',  address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', multiplier: '41000', funding: '10000' },
      { id: 'USDC', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', multiplier: '42850', funding: '10000' },
    ],
  },

  // Goerli Testnet
  5: {
    'chargedManager': '0x6B4738a15052f57B07dbF9E762d0E58D5DcE5C55',
    'chargedParticles': '0xA81cd63F345f323b9785048764e906C9C0D9814D',
    'chargedSettings' : '0xA1F97Fc59fafB2C43600731876710654F60c146E',
    'tokenInfoProxy': '0x8fa84be9492aEA190d62d5f0fc11618d23a9ead2',
    'ionx': '0xa817464e5faD7D5928739E1C37Ef845C53ab1eea',
    'lepton': '0xa99294Caed407273A4b6320CaC68B27C58F46c5d',
    'protonC': '0x92971E5bB4d098CaCf2314292bDb5eDC3f5CF25e',
    'stakingTokens': [
      { id: 'DAI',  address: '0x75Ab5AB1Eef154C0352Fc31D2428Cef80C7F8B33', multiplier: '71500', funding: '10000' },
    ],
  },

  // Hardhat Testnet
  31337: {
    'chargedManager': '0x7b07Ec627d2426b89C44a6cC75Dc57c27a52174d',
    'chargedParticles': '0xaB1a1410EA40930755C1330Cc0fB3367897C8c41',
    'chargedSettings' : '0x07DdB208d52947320d07E0E4611a80Fb7eFD001D',
    'tokenInfoProxy': '0xeF0D1DEDaAF0D9e4B868a049101a9DB1Ba1e50c5',
    'protonC': '',
    'lepton': '',
    'ionx': '',
    'stakingTokens': [
      { id: 'DAI',  address: '0x001b3b4d0f3714ca98ba10f6042daebf0b1b7b6f', multiplier: '20000', funding: '10000' }, // Do-Not-Modify: used in unit-tests
      { id: 'USDC', address: '0x0fa8781a83e46826621b3bc094ea2a0212e71b23', multiplier: '20000', funding: '10000' }, // Do-Not-Modify: used in unit-tests
    ],
  },

  // Polygon Mumbai Testnet
  80001: {
    'chargedManager': '0xE8c6462ceEeeC3f8c318e29Af143f623de979D69',
    'chargedParticles': '0x51f845af34c60499a1056FCDf47BcBC681A0fA39',
    'chargedSettings' : '0x60428D3e580907C74Ee8690E4E192317864aAE1d',
    'tokenInfoProxy': '0xda8d21714ea5784d5b6990c170485effb9104883',
    'protonC': '0x56D0d2e232e73634E5E9aaAB5d1b2f2e68e062Bd',
    'lepton': '',
    'ionx': '',
    'stakingTokens': [
      { id: 'DAI',  address: '0x001b3b4d0f3714ca98ba10f6042daebf0b1b7b6f', multiplier: '20000', funding: '10000' }, // Do-Not-Modify: used in unit-tests
      { id: 'USDC', address: '0x0fa8781a83e46826621b3bc094ea2a0212e71b23', multiplier: '20000', funding: '10000' }, // Do-Not-Modify: used in unit-tests
    ],
  }
}