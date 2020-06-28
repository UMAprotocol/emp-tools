import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";

import Connection from "./Connection";
import EmpState from "./EmpState";

function useToken() {
  const { signer, address, block$ } = Connection.useContainer();
  const { empState } = EmpState.useContainer();
  const tokenAddress = empState.tokenCurrency;

  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const getTokenInfo = async () => {
    if (contract) {
      const symbol = await contract.symbol();
      const name = await contract.name();
      const decimals = await contract.decimals();
      const balanceRaw = await contract.balanceOf(address);
      const balance = ethers.utils.formatUnits(balanceRaw, decimals);

      setSymbol(symbol);
      setName(name);
      setDecimals(decimals);
      setBalance(balance);
    }
  };

  // get token info contract changes
  useEffect(() => {
    getTokenInfo();
  }, [contract]);

  // get token info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getTokenInfo());
      return () => sub.unsubscribe();
    }
  }, [block$, tokenAddress, signer]);

  // set contract when collateral address changes
  useEffect(() => {
    if (signer && tokenAddress) {
      const instance = new ethers.Contract(tokenAddress, erc20.abi, signer);
      setContract(instance);
    }
  }, [signer, tokenAddress]);

  return {
    contract,
    name,
    symbol,
    decimals,
    balance,
    address: tokenAddress,
  };
}

const Token = createContainer(useToken);

export default Token;