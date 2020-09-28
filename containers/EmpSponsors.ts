import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { utils } from "ethers";
const fromWei = utils.formatUnits;

import Connection from "./Connection";
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

interface LiquidationMap {
  [sponsorPlusId: string]: SponsorPositionState;
}

// Interfaces for GraphQl queries.
interface PositionQuery {
  sponsor: { id: string };
  tokensOutstanding: string;
  collateral: string;
  withdrawalRequestPassTimestamp: string;
  withdrawalRequestAmount: string;
  transferPositionRequestPassTimestamp: string;
  isEnded: boolean;
}

interface LiquidationQuery {
  id: string;
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
  const { network } = Connection.useContainer();
  const { contract: emp } = EmpContract.useContainer();
  const { empState } = EmpState.useContainer();
  const { collateralRequirement } = empState;
  const { latestPrice } = PriceFeed.useContainer();
  const { decimals: collDecs } = Collateral.useContainer();
  const { symbol: tokenSymbol } = Token.useContainer();

  const subgraphToQuery = `UMA${network?.chainId.toString()}`;
  const { loading, error, data } = useQuery(EMP_DATA, {
    context: { clientName: subgraphToQuery },
    pollInterval: 10000,
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
          let newLiquidations: LiquidationMap = {};

          const collReqFromWei = parseFloat(fromWei(collateralRequirement));

          empData.positions.forEach((position: PositionQuery) => {
            if (position.isEnded) return;

            const sponsor = utils.getAddress(position.sponsor.id);
            const backingCollateral =
              Number(position.collateral) -
              Number(position.withdrawalRequestAmount);

            const cRatio = getCollateralRatio(
              backingCollateral,
              Number(position.tokensOutstanding),
              latestPrice
            );
            const liquidationPrice = getLiquidationPrice(
              backingCollateral,
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

            if (
              position.tokensOutstanding !== "0" &&
              position.collateral !== "0"
            ) {
              newPositions[sponsor] = {
                tokensOutstanding: position.tokensOutstanding,
                collateral: position.collateral,
                backingCollateral: backingCollateral.toString(),
                cRatio: cRatio.toString(),
                liquidationPrice: liquidationPrice.toString(),
                pendingWithdraw: pendingWithdraw,
                pendingTransfer: pendingTransfer,
                withdrawalRequestAmount: position.withdrawalRequestAmount,
                withdrawalTimestamp: position.withdrawalRequestPassTimestamp,
                transferTimestamp:
                  position.transferPositionRequestPassTimestamp,
                sponsor,
              };
            }
          });

          empData.liquidations.forEach((liquidation: LiquidationQuery) => {
            const liquidationCreatedEvent = liquidation.events.find(
              (e) => e.__typename === "LiquidationCreatedEvent"
            );

            // There should always be a LiquidationCreatedEvent associated with each liquidation object, but if not then
            // we will just ignore this strange edge case.
            if (liquidationCreatedEvent) {
              const liquidatedCR =
                parseFloat(liquidation.tokensLiquidated) > 0
                  ? parseFloat(liquidation.liquidatedCollateral) /
                    parseFloat(liquidation.tokensLiquidated)
                  : 0;
              const maxDisputablePrice =
                parseFloat(liquidation.tokensLiquidated) > 0 &&
                collReqFromWei > 0
                  ? parseFloat(liquidation.liquidatedCollateral) /
                    (parseFloat(liquidation.tokensLiquidated) * collReqFromWei)
                  : 0;

              if (
                liquidation.tokensLiquidated !== "0" &&
                liquidation.lockedCollateral !== "0"
              ) {
                // The UMA subgraph uniquely identifies each liquidation with an "id" that concatenates
                // the liquidated sponsor's address with the liquidation ID, for example:
                // "0x1e17a75616cd74f5846b1b71622aa8e10ea26cc0-0"
                const sponsorAddressPlusId = liquidation.id;
                newLiquidations[sponsorAddressPlusId] = {
                  sponsor: utils.getAddress(liquidation.sponsor.id),
                  liquidator: liquidation.liquidator?.address,
                  disputer: liquidation.disputer?.address,
                  liquidationId: liquidation.liquidationId,
                  liquidatedCR: liquidatedCR.toString(),
                  maxDisputablePrice: maxDisputablePrice.toString(),
                  tokensLiquidated: liquidation.tokensLiquidated,
                  lockedCollateral: liquidation.lockedCollateral,
                  liquidatedCollateral: liquidation.liquidatedCollateral,
                  status: liquidation.status,
                  liquidationTimestamp: liquidationCreatedEvent.timestamp,
                  liquidationReceipt: liquidationCreatedEvent.tx_hash,
                };
              }
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
