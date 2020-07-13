import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumber, Event } from "ethers";

import Connection from "./Connection";
import EmpContract from "./EmpContract";

interface PositionState {
  tokensOutstanding: BigNumber | null;
  lockedCollateral: BigNumber | null;
}

interface SponsorDictionary {
  [address: string]: PositionState;
}

interface EmpDictionary {
  [address: string]: SponsorDictionary;
}

const useEmpSponsors = () => {
  const { block$ } = Connection.useContainer();
  const { contract: emp } = EmpContract.useContainer();

  const [activePositions, setActivePositions] = useState<EmpDictionary>({});

  // get position information about every sponsor that has ever created a position.
  const querySponsors = async () => {
    if (emp) {
      const newSponsorFilter = emp.filters.NewSponsor(null);
      const newSponsorEvents = await emp.queryFilter(newSponsorFilter);

      // Map all active sponsor information to each EMP.
      if (!activePositions[emp.address]) {
        activePositions[emp.address] = {};
      }

      newSponsorEvents.map(async (e: Event) => {
        const sponsorAddress = e.args && e.args.sponsor;

        if (!activePositions[emp.address][sponsorAddress]) {
          const res = await Promise.all([
            emp.positions(sponsorAddress),
            emp.getCollateral(sponsorAddress),
          ]);
          const positionData = res[0];
          const collateral = res[1];

          // Active positions have positive locked collateral
          if (collateral[0].gt(0)) {
            const updatedPositions = activePositions;
            updatedPositions[emp.address][sponsorAddress] = {
              tokensOutstanding: positionData.tokensOutstanding[0],
              lockedCollateral: collateral[0],
            };
            setActivePositions(updatedPositions);
          }
        }
      });
    }
  };

  // get state on setting of contract
  useEffect(() => {
    querySponsors();
  }, [emp]);

  // get state on each block
  useEffect(() => {
    if (block$ && emp) {
      const sub = block$.subscribe(() => querySponsors());
      return () => sub.unsubscribe();
    }
  }, [block$, emp]);

  return { activeSponsors: activePositions };
};

const EmpSponsors = createContainer(useEmpSponsors);

export default EmpSponsors;
