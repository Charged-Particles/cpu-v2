
interface AddressBook {
  [chainId: number]: {
    chargedManager: string;
    chargedParticles: string;
    chargedSettings: string;
  };
}

export const addressBook: AddressBook = {
  1: {
    'chargedManager': '0x7b07Ec627d2426b89C44a6cC75Dc57c27a52174d',
    'chargedParticles': '0xaB1a1410EA40930755C1330Cc0fB3367897C8c41',
    'chargedSettings' : '0x07DdB208d52947320d07E0E4611a80Fb7eFD001D'
  },
  31337: {
    'chargedManager': '0x7b07Ec627d2426b89C44a6cC75Dc57c27a52174d',
    'chargedParticles': '0xaB1a1410EA40930755C1330Cc0fB3367897C8c41',
    'chargedSettings' : '0x07DdB208d52947320d07E0E4611a80Fb7eFD001D'
  },
  80001: {
    'chargedManager': '0xE8c6462ceEeeC3f8c318e29Af143f623de979D69',
    'chargedParticles': '0x51f845af34c60499a1056FCDf47BcBC681A0fA39',
    'chargedSettings' : '0x60428D3e580907C74Ee8690E4E192317864aAE1d'
  }
}