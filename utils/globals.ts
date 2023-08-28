
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
    stakingTokens: Array<StakingToken>;
  };
}

export const addressBook: AddressBook = {
  1: {
    'chargedManager': '0x7b07Ec627d2426b89C44a6cC75Dc57c27a52174d',
    'chargedParticles': '0xaB1a1410EA40930755C1330Cc0fB3367897C8c41',
    'chargedSettings' : '0x07DdB208d52947320d07E0E4611a80Fb7eFD001D',
    'tokenInfoProxy': '0xeF0D1DEDaAF0D9e4B868a049101a9DB1Ba1e50c5',
    'ionx': '0x02D3A27Ac3f55d5D91Fb0f52759842696a864217',
    'lepton': '0x76a5df1c6F53A4B80c8c8177edf52FBbC368E825',
    'stakingTokens': [
      { id: 'DAI',  address: '', multiplier: '10000', funding: '10' },
      { id: 'USDC', address: '', multiplier: '10000', funding: '10' },
    ],
  },
  137: {
    'chargedManager': '0x0f42057be75AF6D977a0cE900E732eA4d490B580',
    'chargedParticles': '0x0288280Df6221E7e9f23c1BB398c820ae0Aa6c10',
    'chargedSettings' : '0xdc29C7014d104432B15eD2334e654fCBf3d5E528',
    'tokenInfoProxy': '0x349eEF86Ea34A69D8B880D5Fd5F39a6d2a7DE716',
    'ionx': '0x01b317bC5eD573FAa112eF64DD029F407CecB155',
    'lepton': '0xe349557325164577Ded350A8cAB03159c728B9E7',
    'stakingTokens': [
      { id: 'DAI',  address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', multiplier: '41000', funding: '10000' },
      { id: 'USDC', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', multiplier: '42850', funding: '10000' },
      { id: 'USDT', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', multiplier: '22750', funding: '10000' },
    ],
  },
  31337: {
    'chargedManager': '0x7b07Ec627d2426b89C44a6cC75Dc57c27a52174d',
    'chargedParticles': '0xaB1a1410EA40930755C1330Cc0fB3367897C8c41',
    'chargedSettings' : '0x07DdB208d52947320d07E0E4611a80Fb7eFD001D',
    'tokenInfoProxy': '0xeF0D1DEDaAF0D9e4B868a049101a9DB1Ba1e50c5',
    'lepton': '',
    'ionx': '',
    'stakingTokens': [
      { id: 'DAI',  address: '0x001b3b4d0f3714ca98ba10f6042daebf0b1b7b6f', multiplier: '20000', funding: '10000' }, // Do-Not-Modify: used in unit-tests
      { id: 'USDC', address: '0x0fa8781a83e46826621b3bc094ea2a0212e71b23', multiplier: '20000', funding: '10000' }, // Do-Not-Modify: used in unit-tests
    ],
  },
  80001: {
    'chargedManager': '0xE8c6462ceEeeC3f8c318e29Af143f623de979D69',
    'chargedParticles': '0x51f845af34c60499a1056FCDf47BcBC681A0fA39',
    'chargedSettings' : '0x60428D3e580907C74Ee8690E4E192317864aAE1d',
    'tokenInfoProxy': '0xda8d21714ea5784d5b6990c170485effb9104883',
    'lepton': '',
    'ionx': '',
    'stakingTokens': [
      { id: 'DAI',  address: '0x001b3b4d0f3714ca98ba10f6042daebf0b1b7b6f', multiplier: '20000', funding: '10000' }, // Do-Not-Modify: used in unit-tests
      { id: 'USDC', address: '0x0fa8781a83e46826621b3bc094ea2a0212e71b23', multiplier: '20000', funding: '10000' }, // Do-Not-Modify: used in unit-tests
    ],
  }
}