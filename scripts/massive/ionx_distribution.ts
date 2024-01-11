import { ethers } from "hardhat";
import csv from 'csv-parser';
import fs from 'fs';
import { Ionx } from "../../typechain-types";
import { Parser } from "json2csv";

const main = async () => {
  let results: any[] = [];

  const inputFile =  'scripts/massive/zealy_rewards_01.csv';
  const outputFile = 'scripts/massive/zealy_rewards_01_out.csv';

  fs.createReadStream(inputFile)
  .pipe(csv({ separator: ',' }))
  .on('data', (row) => {
    results.push(row)
  })
  .on('end', async () => {
    const ionx: Ionx = await ethers.getContractAt('Ionx', '0x01b317bc5ed573faa112ef64dd029f407cecb155');
    const balance = await ionx.balanceOf('0x48F54e595bf039CF30fa5F768c0b57EAC6508a06');
    let balanceLeft = balance;

    for (const user of results){
      if (user._1 == 'Address') continue;

      balanceLeft = balanceLeft - ethers.parseUnits(user.Reward, 18);

      const sendTx = await ionx.transfer(user.Address, ethers.parseUnits(user.Reward, 18), { gasPrice: ethers.parseUnits('50','gwei') }).then(tx => tx.wait());
      user['hashURL'] = 'https://polygonscan.com/tx/' + sendTx?.hash
      user['hash'] = sendTx?.hash;

      console.log(balance.toString());
      console.log(balanceLeft.toString());
      console.log(user);
    };
  });
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});