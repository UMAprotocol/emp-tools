import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { utils } from "ethers";
const fromWei = utils.formatUnits;

import EmpContract from "./EmpContract";
import EmpState from "./EmpState";
import Collateral from "./Collateral";
import Token from "./Token";
import PriceFeed from "./PriceFeed";
import { getLiquidationPrice } from "../utils/getLiquidationPrice";
import { isPricefeedInvertedFromTokenSymbol } from "../utils/getOffchainPrice";

import { useQuery } from "@apollo/client";
import { ACTIVE_POSITIONS } from "../apollo/uma/queries";

// Interfaces for dApp state storage.
interface SponsorPositionState {
  [key: string]: string;
}

interface SponsorMap {
  [sponsor: string]: SponsorPositionState;
}

// Interfaces for GraphQl queries.
interface PositionQuery {
  sponsor: { id: string };
  tokensOutstanding: string;
  collateral: string;
  pendingWithdraw: string;
  pendingTransfer: string;
  withdrawalRequestPassTimestamp: string;
  withdrawalRequestAmount: string;
  transferPositionRequestPassTimestamp: string;
}

interface FinancialContractQuery {
  id: string;
  sponsorPositions: PositionQuery;
}

const useEmpSponsors = () => {
  const { contract: emp } = EmpContract.useContainer();
  const { empState } = EmpState.useContainer();
  const { collateralRequirement } = empState;
  const { latestPrice } = PriceFeed.useContainer();
  const { decimals: collDecs } = Collateral.useContainer();
  const { symbol: tokenSymbol } = Token.useContainer();

  // Because apollo caches results of queries, we will poll/refresh this query periodically.
  // We set the poll interval to a very slow 5 seconds for now since the position states
  // are not expected to change much.
  // Source: https://www.apollographql.com/docs/react/data/queries/#polling
  const { loading, error, data } = useQuery(ACTIVE_POSITIONS, {
    context: { clientName: "UMA" },
    pollInterval: 5000,
  });

  const getCollateralRatio = (
    collateral: number,
    tokens: number,
    price: number
  ) => {
    if (tokens <= 0 || price <= 0) return 0;
    const tokensScaled = tokens * price;
    return collateral / tokensScaled;
  };

  const [activePositions, setActivePositions] = useState<SponsorMap>({});

  // get position information about every sponsor that has ever created a position.
  const querySponsors = () => {
    // Start with a fresh table.
    setActivePositions({});

    if (
      emp !== null &&
      latestPrice !== null &&
      collateralRequirement !== null &&
      collDecs !== null &&
      tokenSymbol !== null
    ) {
      if (error) {
        console.error(`Apollo client failed to fetch graph data:`, error);
      }
      if (!loading && data) {
        const empData = data.financialContracts.find(
          (contract: FinancialContractQuery) =>
            utils.getAddress(contract.id) === emp.address
        );

        if (empData) {
          let newPositions: SponsorMap = {};

          const collReqFromWei = parseFloat(
            fromWei(collateralRequirement, collDecs)
          );

          empData.positions.forEach((position: PositionQuery) => {
            const sponsor = utils.getAddress(position.sponsor.id);

            const cRatio = getCollateralRatio(
              Number(position.collateral),
              Number(position.tokensOutstanding),
              latestPrice
            );
            const liquidationPrice = getLiquidationPrice(
              Number(position.collateral),
              Number(position.tokensOutstanding),
              collReqFromWei,
              isPricefeedInvertedFromTokenSymbol(tokenSymbol)
            );
            const pendingWithdraw =
              position.withdrawalRequestPassTimestamp === "0" ? "No" : "Yes";

            const pendingTransfer =
              position.transferPositionRequestPassTimestamp === "0"
                ? "No"
                : "Yes";

            newPositions[sponsor] = {
              tokensOutstanding: position.tokensOutstanding,
              collateral: position.collateral,
              cRatio: cRatio.toString(),
              liquidationPrice: liquidationPrice.toString(),
              pendingWithdraw: pendingWithdraw,
              pendingTransfer: pendingTransfer,
              withdrawalTimestamp: position.withdrawalRequestPassTimestamp,
              transferTimestamp: position.transferPositionRequestPassTimestamp,
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
  }, [emp, data, latestPrice]);

  return { activeSponsors: activePositions };
};

const EmpSponsors = createContainer(useEmpSponsors);

export default EmpSponsors;
