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
import { EMP_DATA } from "../apollo/uma/queries";

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
}

interface LiquidationQuery {
  sponsor: { id: string };
  liquidationId: string;
  liquidator: { address: string };
  disputer: { address: string };
  tokensLiquidated: string;
  lockedCollateral: string;
  liquidatedCollateral: string;
  status: string;
  events: {
    __typename: string;
    tx_hash: string;
    timestamp: string;
  }[];
}

interface FinancialContractQuery {
  id: string;
  sponsorPositions: PositionQuery;
  sponsorLiquidations: LiquidationQuery;
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
  const { loading, error, data } = useQuery(EMP_DATA, {
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
  const [liquidations, setLiquidations] = useState<SponsorMap>({});

  // get position information about every sponsor that has ever created a position.
  const querySponsors = () => {
    // Start with a fresh table.
    setActivePositions({});
    setLiquidations({});

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
          let newLiquidations: SponsorMap = {};

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

            newPositions[sponsor] = {
              tokensOutstanding: position.tokensOutstanding,
              collateral: position.collateral,
              cRatio: cRatio.toString(),
              liquidationPrice: liquidationPrice.toString(),
              sponsor,
            };
          });

          empData.liquidations.forEach((liquidation: LiquidationQuery) => {
            const sponsor = utils.getAddress(liquidation.sponsor.id);
            const liquidationCreatedEvent = liquidation.events.find(
              (e) => e.__typename === "LiquidationCreatedEvent"
            );
            if (liquidationCreatedEvent) {
              const liquidatedCR =
                parseFloat(liquidation.tokensLiquidated) > 0
                  ? parseFloat(liquidation.liquidatedCollateral) /
                    parseFloat(liquidation.tokensLiquidated)
                  : 0;
              // There should always be a LiquidationCreatedEvent associated with each liquidation object, but if not then
              // we will just ignore this strange edge case.
              newLiquidations[sponsor] = {
                sponsor,
                liquidator: liquidation.liquidator?.address,
                disputer: liquidation.disputer?.address,
                liquidationId: liquidation.liquidationId,
                liquidatedCR: liquidatedCR.toString(),
                tokensLiquidated: liquidation.tokensLiquidated,
                lockedCollateral: liquidation.lockedCollateral,
                status: liquidation.status,
                liquidationTimestamp: liquidationCreatedEvent.timestamp,
                liquidationReceipt: liquidationCreatedEvent.tx_hash,
              };
            }
          });

          setActivePositions(newPositions);
          setLiquidations(newLiquidations);
        }
      }
    }
  };

  // Change state when emp changes or when the graphQL data changes due to polling.
  useEffect(() => {
    querySponsors();
  }, [emp, data, latestPrice]);

  return { activeSponsors: activePositions, liquidations: liquidations };
};

const EmpSponsors = createContainer(useEmpSponsors);

export default EmpSponsors;
