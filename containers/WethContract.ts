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
  const [wethAllowance, setWethAllowance] = useState<number | null>(null);

  const getTokenInfo = async () => {
    if (contract) {
      const wethBalanceRaw: BigNumber = await contract.balanceOf(address);
      const wethAllowanceRaw: BigNumber = await contract.allowance(
        address,
        weth.address
      );

      const wethBalance = parseFloat(utils.formatEther(wethBalanceRaw));
      const wethAllowance = parseFloat(utils.formatEther(wethAllowanceRaw));

      setWethBalance(wethBalance);
      setWethAllowance(wethAllowance);
    }

    if (provider) {
      const ethBalanceRaw: BigNumber = await provider.getBalance(
        address as string
      );
      const ethBalance = parseFloat(utils.formatEther(ethBalanceRaw));
      setEthBalance(ethBalance);
    }
  };

  const setMaxAllowance = async () => {
    if (contract) {
      try {
        await contract.approve(weth.address, ethers.constants.MaxUint256);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // get token info when contract changes or when address is reset
  useEffect(() => {
    setWethBalance(null);
    setWethAllowance(null);
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

  return { contract, ethBalance, wethBalance, wethAllowance, setMaxAllowance };
}

const Contract = createContainer(useContract);

export default Contract;
