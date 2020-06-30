import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";

import Connection from "./Connection";
import EmpState from "./EmpState";
import EmpAddress from "./EmpAddress";

const fromWei = ethers.utils.formatUnits;

function useCollateral() {
  const { signer, address, block$ } = Connection.useContainer();
  const { empAddress } = EmpAddress.useContainer();
  const { empState } = EmpState.useContainer();
  const collAddress = empState.collateralCurrency;

  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<number | null>(null);
  const [allowance, setAllowance] = useState<number | "Infinity" | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const getCollateralInfo = async () => {
    if (contract) {
      const symbol = await contract.symbol();
      const name = await contract.name();
      const decimals = await contract.decimals();
      const allowanceRaw = await contract.allowance(address, empAddress);
      const allowance = allowanceRaw.eq(ethers.constants.MaxUint256)
        ? "Infinity"
        : parseFloat(fromWei(allowanceRaw, decimals));
      const balanceRaw = await contract.balanceOf(address);
      const balance = fromWei(balanceRaw, decimals);

      setSymbol(symbol);
      setName(name);
      setDecimals(decimals);
      setAllowance(allowance);
      setBalance(balance);
    }
  };

  // get collateral info when contract changes
  useEffect(() => {
    setSymbol(null);
    setName(null);
    setDecimals(null);
    setAllowance(null);
    setBalance(null);
    getCollateralInfo();
  }, [contract]);

  // get collateral info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getCollateralInfo());
      return () => sub.unsubscribe();
    }
  }, [block$, collAddress, signer, contract]);

  // set contract when collateral address changes
  useEffect(() => {
    if (signer && collAddress) {
      const instance = new ethers.Contract(collAddress, erc20.abi, signer);
      setContract(instance);
    }
  }, [signer, collAddress]);

  return {
    contract,
    name,
    symbol,
    decimals,
    allowance,
    balance,
    address: collAddress,
  };
}

const Collateral = createContainer(useCollateral);

export default Collateral;
