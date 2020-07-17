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
      const wethBalance = parseFloat(utils.formatEther(wethBalanceRaw));
      setWethBalance(wethBalance);
    }

    if (provider) {
      const ethBalanceRaw: BigNumber = await provider.getBalance(
        address as string
      );
      const ethBalance = parseFloat(utils.formatEther(ethBalanceRaw));
      setEthBalance(ethBalance);
    }
  };

  // get token info when contract changes or when address is reset
  useEffect(() => {
    setWethBalance(null);
    setEthBalance(null);
    if (address) {
      getBalanceInfo();
    }
  }, [contract, address, provider]);

  // get token info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getBalanceInfo());
      return () => sub.unsubscribe();
    }
  }, [block$, contract, address, provider]);

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
