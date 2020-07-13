import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumber, Bytes } from "ethers";

import Connection from "./Connection";
import EmpContract from "./EmpContract";

interface PositionState {
  sponsor: string | null;
  withdrawalRequestPassTimestamp: number | null;
  withdrawalRequestAmount: BigNumber | null;
  numTokens: BigNumber | null;
  amountCollateral: BigNumber | null;
}

const useEmpSponsors = () => {
  const { block$ } = Connection.useContainer();
  const { contract: emp } = EmpContract.useContainer();

  const [allPositions, setAllPositions] = useState<PositionState[]>([]);

  // get state from EMP
  const queryState = async () => {
    if (emp) {
    //   // have to do this ugly thing because we want to call in parallel
    //   const res = await Promise.all([
    //     emp.expirationTimestamp(),
    //     emp.collateralCurrency(),
    //     emp.priceIdentifier(),
    //     emp.tokenCurrency(),
    //     emp.collateralRequirement(),
    //     emp.disputeBondPct(),
    //     emp.disputerDisputeRewardPct(),
    //     emp.sponsorDisputeRewardPct(),
    //     emp.minSponsorTokens(),
    //     emp.timerAddress(),
    //     emp.cumulativeFeeMultiplier(),
    //     emp.rawTotalPositionCollateral(),
    //     emp.totalTokensOutstanding(),
    //     emp.liquidationLiveness(),
    //   ]);

    //   const newState: ContractState = {
    //     expirationTimestamp: res[0] as BigNumber,
    //     collateralCurrency: res[1] as string, // address
    //     priceIdentifier: res[2] as Bytes,
    //     tokenCurrency: res[3] as string, // address
    //     collateralRequirement: res[4] as BigNumber,
    //     disputeBondPct: res[5] as BigNumber,
    //     disputerDisputeRewardPct: res[6] as BigNumber,
    //     sponsorDisputeRewardPct: res[7] as BigNumber,
    //     minSponsorTokens: res[8] as BigNumber,
    //     timerAddress: res[9] as string, // address
    //     cumulativeFeeMultiplier: res[10] as BigNumber,
    //     rawTotalPositionCollateral: res[11] as BigNumber,
    //     totalTokensOutstanding: res[12] as BigNumber,
    //     liquidationLiveness: res[13] as BigNumber,
    //   };

    //   setState(newState);
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

  return { empSponsors: allPositions };
};

const EmpSponsors = createContainer(useEmpSponsors);

export default EmpSponsors;
