import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumber, Bytes } from "ethers";

import Connection from "./Connection";
import EmpContract from "./EmpContract";

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
  liquidationLiveness: BigNumber | null;
  withdrawalLiveness: BigNumber | null;
  currentTime: BigNumber | null;
  isExpired: boolean | null;
  contractState: number | null;
  finderAddress: string | null;
  expiryPrice: BigNumber | null;
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
  liquidationLiveness: null,
  withdrawalLiveness: null,
  currentTime: null,
  isExpired: null,
  contractState: null,
  finderAddress: null,
  expiryPrice: null,
};

const useContractState = () => {
  const { block$ } = Connection.useContainer();
  const { contract: emp } = EmpContract.useContainer();

  const [state, setState] = useState<ContractState>(initState);

  // get state from EMP
  const queryState = async () => {
    if (emp === null) {
      setState(initState);
    }
    if (emp) {
      // have to do this ugly thing because we want to call in parallel
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
        emp.liquidationLiveness(),
        emp.withdrawalLiveness(),
        emp.getCurrentTime(),
        emp.contractState(),
        emp.finder(),
        emp.expiryPrice(),
      ]);

      const newState: ContractState = {
        expirationTimestamp: res[0] as BigNumber,
        collateralCurrency: res[1] as string, // address
        priceIdentifier: res[2] as Bytes,
        tokenCurrency: res[3] as string, // address
        collateralRequirement: res[4] as BigNumber,
        disputeBondPct: res[5] as BigNumber,
        disputerDisputeRewardPct: res[6] as BigNumber,
        sponsorDisputeRewardPct: res[7] as BigNumber,
        minSponsorTokens: res[8] as BigNumber,
        timerAddress: res[9] as string, // address
        cumulativeFeeMultiplier: res[10] as BigNumber,
        rawTotalPositionCollateral: res[11] as BigNumber,
        totalTokensOutstanding: res[12] as BigNumber,
        liquidationLiveness: res[13] as BigNumber,
        withdrawalLiveness: res[14] as BigNumber,
        currentTime: res[15] as BigNumber,
        isExpired: Number(res[15]) >= Number(res[0]),
        contractState: Number(res[16]),
        finderAddress: res[17] as string, // address
        expiryPrice: res[18] as BigNumber,
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
