import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers, BigNumber, utils } from "ethers";
import { weth } from "@studydefi/money-legos/erc20";

import Connection from "./Connection";

function useContract() {
  const { signer, address, block$, provider } = Connection.useContainer();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [ethBalance, setEthBalance] = useState<number | null>(null);
  const [wethBalance, setWethBalance] = useState<number | null>(null);

  const getBalanceInfo = async () => {
    if (contract) {
      const wethBalanceRaw: BigNumber = await contract.balanceOf(address);
      console.log(wethBalanceRaw.toString());

      // calculate readable balances.
      const wethBalance = parseFloat(utils.formatEther(wethBalanceRaw));

      setWethBalance(wethBalance);
    }
    if (provider) {
      const ethBalanceRaw: BigNumber = await provider.getBalance(
        address as string
      );
      console.log(ethBalanceRaw.toString());

      // calculate readable balances.
      const ethBalance = parseFloat(utils.formatEther(ethBalanceRaw));

      setEthBalance(ethBalance);
    }
  };

  // get token info when contract changes
  useEffect(() => {
    setWethBalance(null);
    setEthBalance(null);
    getBalanceInfo();
  }, [contract]);

  // get token info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getBalanceInfo());
      return () => sub.unsubscribe();
    }
  }, [block$, signer, contract]);

  useEffect(() => {
    if (signer) {
      const instance = new ethers.Contract(weth.address, weth.abi, signer);
      setContract(instance);
    }
  }, [signer]);

  return { contract, ethBalance, wethBalance };
}

const Contract = createContainer(useContract);

export default Contract;
