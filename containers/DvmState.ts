import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { utils } from "ethers";

import { useQuery } from "@apollo/client";
import { PRICE_REQUESTS } from "../apollo/uma/queries";

import Connection from "./Connection";
import Collateral from "./Collateral";
import DvmContract from "./DvmContract";
import EmpState from "./EmpState";

const { formatUnits: fromWei, parseBytes32String: hexToUtf8 } = utils;

interface ContractState {
  hasEmpPrice: boolean | null;
  resolvedPrice: number | null;
  finalFee: number | null;
}

const initState = {
  hasEmpPrice: null,
  resolvedPrice: null,
  finalFee: null,
};

// Taken from Voting.sol implementation.
enum PRICE_REQUEST_STATUSES {
  NOT_REQUESTED, // Was never requested.
  ACTIVE, // Is being voted on in the current round.
  RESOLVED, // Was resolved in a previous round.
  FUTURE, // Is scheduled to be voted on in a future round.
}

interface PriceRequestQuery {
  identifier: {
    id: string;
  };
  time: string;
}

const useContractState = () => {
  const { block$ } = Connection.useContainer();
  const {
    votingContract: dvm,
    storeContract: store,
  } = DvmContract.useContainer();
  const { address: collAddress } = Collateral.useContainer();
  const { empState } = EmpState.useContainer();
  const { priceIdentifier, expirationTimestamp } = empState;

  const [state, setState] = useState<ContractState>(initState);

  // Because apollo caches results of queries, we will poll/refresh this query periodically.
  // We set the poll interval to a very slow 5 seconds for now since the position states
  // are not expected to change much.
  // Source: https://www.apollographql.com/docs/react/data/queries/#polling
  const { loading, error, data } = useQuery(PRICE_REQUESTS, {
    context: { clientName: "UMA" },
    pollInterval: 5000,
  });

  // get state from EMP
  const queryState = async () => {
    if (
      dvm !== null &&
      store !== null &&
      collAddress !== null &&
      priceIdentifier !== null &&
      expirationTimestamp !== null
    ) {
      const res = await Promise.all([
        dvm.getPriceRequestStatuses([
          {
            identifier: priceIdentifier.toString(),
            time: expirationTimestamp.toNumber(),
          },
        ]),
        store.computeFinalFee(collAddress),
      ]);

      const hasPrice = res[0][0].status === PRICE_REQUEST_STATUSES.RESOLVED;
      const finalFee = parseFloat(fromWei(res[1][0].toString()));

      let resolvedPrice = null;

      // Fetch price from graph if available.
      if (error) {
        console.error(`Apollo client failed to fetch graph data:`, error);
      } else if (hasPrice && !loading && data) {
        // Implementation 1: Use subgraph data. This works for mainnet but not Kovan since the UMA subgraph does not currently index Kovan data.
        const matchingPriceRequest = data.priceRequests.find(
          (request: PriceRequestQuery) => {
            return (
              request.identifier.id === hexToUtf8(priceIdentifier) &&
              request.time === expirationTimestamp.toString()
            );
          }
        );
        if (matchingPriceRequest && matchingPriceRequest.isResolved) {
          resolvedPrice = parseFloat(
            fromWei(matchingPriceRequest.price.toString())
          );
        }

        // // Implementation 2: Call contract. This works for Kovan/MockOracle and is therefore useful for testing, but not mainnet since `getPrice` must be called with the overrideL `{from: emp.address}`.
        // try {
        //   const postResolutionRes = await Promise.all([
        //     // `getPrice()` will fail on mainnet because the deployed `Voting.getPrice()` is required to be called from a registered contract, such as this EMP!
        //     // TODO: Figure out a way to spoof the `from` parameter in this contract call and set to `emp.address`.
        //     dvm.getPrice(
        //       priceIdentifier.toString(),
        //       expirationTimestamp.toNumber()
        //     ),
        //   ]);
        //   resolvedPrice = parseFloat(fromWei(postResolutionRes.toString()));
        // } catch (err) {
        //   console.error(`getPrice failed:`, err);
        // }
      }

      const newState: ContractState = {
        hasEmpPrice: hasPrice,
        resolvedPrice: resolvedPrice,
        finalFee: finalFee,
      };

      setState(newState);
    }
  };

  // get state on setting of contract
  useEffect(() => {
    // setState(initState);

    queryState();
  }, [dvm, priceIdentifier, expirationTimestamp]);

  // get state on each block
  useEffect(() => {
    if (block$ && dvm) {
      const sub = block$.subscribe(() => queryState());
      return () => sub.unsubscribe();
    }
  }, [block$, dvm]);

  return { dvmState: state };
};

const DvmState = createContainer(useContractState);

export default DvmState;
