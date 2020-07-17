import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers, BigNumber, utils } from "ethers";
import { weth } from "@studydefi/money-legos/erc20";

import Connection from "./Connection";

function useContract() {
  const { signer, address, block$, provider } = Connection.useContainer();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [wethBalance, setWethBalance] = useState<string | null>(null);

  const getTokenInfo = async () => {
    if (contract) {
      const wethBalanceRaw: BigNumber = await contract.balanceOf(address);
      const wethBalance = utils.formatEther(wethBalanceRaw);
      setWethBalance(wethBalance);
    }

    if (provider) {
      const ethBalanceRaw: BigNumber = await provider.getBalance(
        address as string
      );
      const ethBalance = utils.formatEther(ethBalanceRaw);
      setEthBalance(ethBalance);
    }
  };

  // get token info when contract changes or when address is reset
  useEffect(() => {
    setWethBalance(null);
    setEthBalance(null);
    if (address) {
      getTokenInfo();
    }
  }, [contract, address, provider]);

  // get token info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getTokenInfo());
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
