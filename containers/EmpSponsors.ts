import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumberish, utils } from "ethers";

import Connection from "./Connection";
import EmpContract from "./EmpContract";

import { useQuery } from "@apollo/client";
import { ACTIVE_POSITIONS } from "../apollo/queries";

interface PositionState {
  tokensOutstanding: BigNumberish;
  collateral: BigNumberish;
  id: string;
}

interface SponsorMap {
  [address: string]: PositionState;
}

interface EmpMap {
  [address: string]: SponsorMap;
}

interface FinancialContractQuery {
  id: string;
  sponsorPositions: PositionState;
}

const useEmpSponsors = () => {
  const { block$ } = Connection.useContainer();
  const { contract: emp } = EmpContract.useContainer();
  const { loading, error, data } = useQuery(ACTIVE_POSITIONS);

  const [activePositions, setActivePositions] = useState<EmpMap>({});

  // get position information about every sponsor that has ever created a position.
  const querySponsors = async () => {
    if (emp) {
      if (error) {
        console.error(`Apollo client failed to fetch graph data:`, error);
      }
      if (!loading && data) {
        // Create a clone of the active-positions mapping that we can update.
        let newPositions = { ...activePositions };

        // Map all active sponsor information to each EMP.
        if (!newPositions[emp.address]) {
          newPositions[emp.address] = {};
        }

        data.financialContracts
          .find(
            (contract: FinancialContractQuery) =>
              utils.getAddress(contract.id) === emp.address
          )
          .sponsorPositions.forEach((position: PositionState) => {
            const address = utils.getAddress(position.id.split("-")[0]);

            newPositions[emp.address][address] = {
              tokensOutstanding: position.tokensOutstanding,
              collateral: position.collateral,
              id: address,
            };
            setActivePositions(newPositions);
          });
      }
    }
  };

  // Update sponsor list when emp state changes and graphql query stops loading
  useEffect(() => {
    querySponsors();
  }, [loading, emp]);

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
