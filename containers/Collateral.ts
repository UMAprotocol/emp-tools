import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";

import Connection from "./Connection";
import EmpAddress from "./EmpAddress";
import EmpState from "./EmpState";

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
  const [balance, setBalance] = useState<number | null>(null);
  const [allowance, setAllowance] = useState<number | "Infinity" | null>(null);

  const getCollateralInfo = async () => {
    if (contract) {
      const symbol: string = await contract.symbol();
      const name: string = await contract.name();
      const decimals: number = await contract.decimals();
      const balanceRaw: BigNumber = await contract.balanceOf(address);
      const allowanceRaw: BigNumber = await contract.allowance(
        address,
        empAddress
      );

      // calculate readable balance and allowance
      const balance = parseFloat(fromWei(balanceRaw, decimals));
      const allowance = allowanceRaw.eq(ethers.constants.MaxUint256)
        ? "Infinity"
        : parseFloat(fromWei(allowanceRaw, decimals));

      // set states
      setSymbol(symbol);
      setName(name);
      setDecimals(decimals);
      setBalance(balance);
      setAllowance(allowance);
    }
  };

  const setMaxAllowance = async () => {
    if (contract && empAddress) {
      try {
        await contract.approve(empAddress, ethers.constants.MaxUint256);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // get collateral info when contract changes
  useEffect(() => {
    setSymbol(null);
    setName(null);
    setDecimals(null);
    setBalance(null);
    setAllowance(null);
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
    address: collAddress,
    contract,
    name,
    symbol,
    decimals,
    balance,
    allowance,
    setMaxAllowance,
  };
}

const Collateral = createContainer(useCollateral);

export default Collateral;
