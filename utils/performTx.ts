import { ContractTransactionReceipt, ContractTransactionResponse } from 'ethers';

export const performTx = async (tx: ContractTransactionResponse, msg: string) => {
  const rc: ContractTransactionReceipt | null = await tx.wait();
  if (rc !== null) {
    console.log(msg.replace(/\{id}/ig, '123'));
  }
};
