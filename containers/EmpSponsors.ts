import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumberish, utils } from "ethers";

import EmpContract from "./EmpContract";

import { useQuery } from "@apollo/client";
import { ACTIVE_POSITIONS } from "../apollo/uma/queries";

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
  // Because apollo caches results of queries, we will poll/refresh this query periodically.
  // We set the poll interval to a very slow 5 seconds for now since the position states
  // are not expected to change much.
  // Source: https://www.apollographql.com/docs/react/data/queries/#polling
  const { loading, error, data } = useQuery(ACTIVE_POSITIONS, {
    context: { clientName: "UMA" },
    pollInterval: 5000,
  });

  const [activePositions, setActivePositions] = useState<SponsorMap>({});

  // get position information about every sponsor that has ever created a position.
  const querySponsors = () => {
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

        if (empData) {
          empData.positions.forEach((position: PositionQuery) => {
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
    }
  };

  // Change state when emp changes or when the graphQL data changes due to polling.
  useEffect(() => {
    querySponsors();
  }, [emp, data]);

  return { activeSponsors: activePositions };
};

const EmpSponsors = createContainer(useEmpSponsors);

export default EmpSponsors;
