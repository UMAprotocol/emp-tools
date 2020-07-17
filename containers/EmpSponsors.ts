import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumberish, utils } from "ethers";

import EmpContract from "./EmpContract";

import { useQuery } from "@apollo/client";
import { ACTIVE_POSITIONS } from "../apollo/queries";

// Interfaces for dApp state storage.
interface PositionState {
  tokensOutstanding: BigNumberish;
  collateral: BigNumberish;
}

interface SponsorPositionState extends PositionState {
  sponsor: string;
}

interface SponsorMap {
  [sponsor: string]: SponsorPositionState;
}

// Interfaces for GraphQl queries.
interface PositionQuery extends PositionState {
  sponsor: { id: string };
}

interface FinancialContractQuery {
  id: string;
  sponsorPositions: PositionQuery;
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
        const empData = data.financialContracts.find(
          (contract: FinancialContractQuery) =>
            utils.getAddress(contract.id) === emp.address
        );

        empData.sponsorPositions.forEach((position: PositionQuery) => {
          const sponsor = utils.getAddress(position.sponsor.id);

          newPositions[sponsor] = {
            tokensOutstanding: position.tokensOutstanding,
            collateral: position.collateral,
            sponsor,
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
