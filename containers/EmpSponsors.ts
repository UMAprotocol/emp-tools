import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumberish, utils } from "ethers";

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

interface FinancialContractQuery {
  id: string;
  sponsorPositions: PositionState;
}

const useEmpSponsors = () => {
  const { contract: emp } = EmpContract.useContainer();
  const { loading, error, data } = useQuery(ACTIVE_POSITIONS);

  const [activePositions, setActivePositions] = useState<SponsorMap>({});

  // get position information about every sponsor that has ever created a position.
  const querySponsors = async () => {
    // Start with a fresh table.
    let newPositions: SponsorMap = {};
    if (emp) {
      if (error) {
        console.error(`Apollo client failed to fetch graph data:`, error);
      }
      if (!loading && data) {
        data.financialContracts
          .find(
            (contract: FinancialContractQuery) =>
              utils.getAddress(contract.id) === emp.address
          )
          .sponsorPositions.forEach((position: PositionState) => {
            const address = utils.getAddress(position.id.split("-")[0]);

            newPositions[address] = {
              tokensOutstanding: position.tokensOutstanding,
              collateral: position.collateral,
              id: address,
            };
          });

        setActivePositions(newPositions);
      }
    }
  };

  useEffect(() => {
    querySponsors();
  }, [emp]);

  return { activeSponsors: activePositions };
};

const EmpSponsors = createContainer(useEmpSponsors);

export default EmpSponsors;
