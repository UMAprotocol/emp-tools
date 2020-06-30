import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumber, Bytes, ethers, BigNumberish } from "ethers";

import Connection from "./Connection";
import Contract from "./Contract";

interface ContractState {
  expirationTimestamp: BigNumber | null;
  collateralCurrency: string | null;
  priceIdentifier: Bytes | null;
  tokenCurrency: string | null;
  collateralRequirement: BigNumber | null;
  disputeBondPct: BigNumber | null;
  disputerDisputeRewardPct: BigNumber | null;
  sponsorDisputeRewardPct: BigNumber | null;
  minSponsorTokens: BigNumber | null;
  timerAddress: string | null;
  cumulativeFeeMultiplier: BigNumber | null;
  rawTotalPositionCollateral: BigNumber | null;
  totalTokensOutstanding: BigNumber | null;
}

const initState = {
  expirationTimestamp: null,
  collateralCurrency: null,
  priceIdentifier: null,
  tokenCurrency: null,
  collateralRequirement: null,
  disputeBondPct: null,
  disputerDisputeRewardPct: null,
  sponsorDisputeRewardPct: null,
  minSponsorTokens: null,
  timerAddress: null,
  cumulativeFeeMultiplier: null,
  rawTotalPositionCollateral: null,
  totalTokensOutstanding: null,
};

const useContractState = () => {
  const { block$ } = Connection.useContainer();
  const { contract: emp } = Contract.useContainer();

  const [state, setState] = useState<ContractState>(initState);

  // get state from EMP
  const queryState = async () => {
    if (emp === null) {
      setState(initState);
    }
    if (emp) {
      // have to do this ugly thing because we want call in parallel
      const res = await Promise.all([
        emp.expirationTimestamp(),
        emp.collateralCurrency(),
        emp.priceIdentifier(),
        emp.tokenCurrency(),
        emp.collateralRequirement(),
        emp.disputeBondPct(),
        emp.disputerDisputeRewardPct(),
        emp.sponsorDisputeRewardPct(),
        emp.minSponsorTokens(),
        emp.timerAddress(),
        emp.cumulativeFeeMultiplier(),
        emp.rawTotalPositionCollateral(),
        emp.totalTokensOutstanding(),
      ]);

      const newState: ContractState = {
        expirationTimestamp: res[0],
        collateralCurrency: res[1],
        priceIdentifier: res[2],
        tokenCurrency: res[3],
        collateralRequirement: res[4],
        disputeBondPct: res[5],
        disputerDisputeRewardPct: res[6],
        sponsorDisputeRewardPct: res[7],
        minSponsorTokens: res[8],
        timerAddress: res[9],
        cumulativeFeeMultiplier: res[10],
        rawTotalPositionCollateral: res[11],
        totalTokensOutstanding: res[12],
      };

      setState(newState);
    }
  };

  // get state on setting of contract
  useEffect(() => {
    queryState();
  }, [emp]);

  // get state on each block
  useEffect(() => {
    if (block$ && emp) {
      const sub = block$.subscribe(() => queryState());
      return () => sub.unsubscribe();
    }
  }, [block$, emp]);

  return { empState: state };
};

const EmpState = createContainer(useContractState);

export default EmpState;
