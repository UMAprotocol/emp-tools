import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers, BigNumberish } from "ethers";

import EmpState from "./EmpState";
import Collateral from "./Collateral";
import Token from "./Token";

const fromWei = ethers.utils.formatUnits;
const weiToNum = (x: BigNumberish, u = 18) => parseFloat(fromWei(x, u));

function useTotals() {
  const { empState } = EmpState.useContainer();
  const { decimals: collDec } = Collateral.useContainer();
  const { decimals: tokenDec } = Token.useContainer();

  const [totalCollateral, setTotalCollateral] = useState<number | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [gcr, setGCR] = useState<number | null>(null);

  const {
    cumulativeFeeMultiplier: multiplier,
    rawTotalPositionCollateral: rawColl,
    totalTokensOutstanding: totalTokensWei,
  } = empState;

  // set GCR when state updates
  useEffect(() => {
    if (multiplier && rawColl && totalTokensWei && collDec && tokenDec) {
      // use multiplier to find real total collateral in EMP
      const totalColl = weiToNum(multiplier) * weiToNum(rawColl, collDec);
      const totalTokens = weiToNum(totalTokensWei, tokenDec);
      const gcr = totalColl / totalTokens;

      // set states
      setTotalCollateral(totalColl);
      setTotalTokens(totalTokens);
      setGCR(gcr);
    }
  }, [empState, collDec, tokenDec]);

  return { totalCollateral, totalTokens, gcr };
}

const Totals = createContainer(useTotals);

export default Totals;
