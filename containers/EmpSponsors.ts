import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumber, Event } from "ethers";

import Connection from "./Connection";
import EmpContract from "./EmpContract";

interface PositionState {
  tokensOutstanding: BigNumber | null;
  lockedCollateral: BigNumber | null;
}

interface SponsorMap {
  [address: string]: PositionState;
}

interface EmpMap {
  [address: string]: SponsorMap;
}

const useEmpSponsors = () => {
  const { block$ } = Connection.useContainer();
  const { contract: emp } = EmpContract.useContainer();

  const [activePositions, setActivePositions] = useState<EmpMap>({});

  // get position information about every sponsor that has ever created a position.
  const querySponsors = async () => {
    if (emp) {
      const newSponsorFilter = emp.filters.NewSponsor(null);
      const newSponsorEvents = await emp.queryFilter(newSponsorFilter);

      // Create a clone of the active-positions mapping that we can update.
      let newPositions = { ...activePositions };

      // Map all active sponsor information to each EMP.
      if (!newPositions[emp.address]) {
        newPositions[emp.address] = {};
      }

      newSponsorEvents.forEach(async (e: Event) => {
        const sponsorAddress = e.args?.sponsor;

        if (!newPositions[emp.address][sponsorAddress]) {
          // Check if sponsor has a current position. Current positions have locked
          // a non-zero amount of collateral.
          const res = await Promise.all([
            emp.positions(sponsorAddress),
            emp.getCollateral(sponsorAddress),
          ]);
          const positionData = res[0];
          const collateral = res[1];

          // Update the active positions mapping.
          if (collateral[0].gt(0)) {
            newPositions[emp.address][sponsorAddress] = {
              tokensOutstanding: positionData.tokensOutstanding[0],
              lockedCollateral: collateral[0],
            };
            setActivePositions(newPositions);
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
    if (block$) {
      const sub = block$.subscribe(() => querySponsors());
      return () => sub.unsubscribe();
    }
  }, [block$, emp]);

  return { activeSponsors: activePositions };
};

const EmpSponsors = createContainer(useEmpSponsors);

export default EmpSponsors;
