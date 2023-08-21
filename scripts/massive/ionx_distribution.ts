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
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    results.push(row)
  })
  .on('end', async () => {
    for (const user of results){
      if (user._1 == 'Zealy Name') continue;

      const dollarReward = Number(user._3);
      const ionxAmount = dollarReward / 0.022329;

      user['ionxAmount'] = ionxAmount;
      const ionx: Ionx = await ethers.getContractAt('Ionx', '0x01b317bc5ed573faa112ef64dd029f407cecb155');

      const balance = await ionx.balanceOf('0x48F54e595bf039CF30fa5F768c0b57EAC6508a06');
      // const sendTx = await ionx.transfer(user._4, ethers.parseEther(String(ionxAmount)), { gasPrice: ethers.parseUnits('200','gwei') }).then(tx => tx.wait());
      // user['hashURL'] = 'https://polygonscan.com/tx/' + sendTx?.hash
      // user['hash'] = sendTx?.hash;
      console.log(balance.toString());
    };
  });
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});