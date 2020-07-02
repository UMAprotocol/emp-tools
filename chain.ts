require("dotenv").config();

import Ganache from "ganache-core";
import { ethers } from "ethers";
import { getDai } from "./utils/getDai";

const port = 8545;
const nodeUrl = process.env.MAINNET_NODE_URL;
const privKey = process.env.PRIV_KEY;

// start server
const server = Ganache.server({
  fork: nodeUrl,
  network_id: 1,
  gasLimit: 20000000,
  accounts: [
    {
      secretKey: privKey,
      balance: ethers.utils.hexlify(ethers.utils.parseEther("1000")),
    },
  ],
});

// listen and run post-launch code
server.listen(port, async (err: any) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Forked off of node: ${nodeUrl}\n`);
    console.log(`Test private key:\n`);
    console.log(`\t${privKey}`);
    console.log(`\nTest chain started on port ${port}, listening...`);

    // retrieve some DAI from Uniswap
    if (privKey) {
      const provider = new ethers.providers.JsonRpcProvider();
      const wallet = new ethers.Wallet(privKey);
      await getDai(wallet.connect(provider));
    }
  }
});

export {};
