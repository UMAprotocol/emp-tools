import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers, BigNumberish } from "ethers";
import EmpState from "./EmpState";
import Token from "./Token";
import Collateral from "./Collateral";

const fromWei = ethers.utils.formatUnits;
const weiToNum = (x: BigNumberish, decimals = 18) =>
  parseFloat(fromWei(x, decimals));

function useTotals() {
  const { empState } = EmpState.useContainer();
  const { decimals: collDec } = Collateral.useContainer();
  const { decimals: tokenDec } = Token.useContainer();
  const [totalCollateral, setTotalCollateral] = useState<number | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [gcr, setGCR] = useState<number | null>(null);

  // set GCR when state updates
  useEffect(() => {
    const {
      cumulativeFeeMultiplier: multiplier,
      rawTotalPositionCollateral: rawColl,
      totalTokensOutstanding: totalTokensWei,
    } = empState;

    if (collDec && tokenDec) {
      const totalColl =
        multiplier && rawColl
          ? weiToNum(multiplier) * weiToNum(rawColl, collDec)
          : null;
      const totalTokens = totalTokensWei
        ? weiToNum(totalTokensWei, tokenDec)
        : null;
      const gcr = totalColl && totalTokens ? totalColl / totalTokens : null;

      setTotalCollateral(totalColl);
      setTotalTokens(totalTokens);
      setGCR(gcr);
    }
  }, [empState, collDec, tokenDec]);

  return {
    totalCollateral,
    totalTokens,
    gcr,
  };
}

const Totals = createContainer(useTotals);

export default Totals;
