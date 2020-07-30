import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { utils } from "ethers";

import Connection from "./Connection";
import DvmContract from "./DvmContract";
import EmpState from "./EmpState";

const { formatUnits: fromWei } = utils;

interface ContractState {
  hasEmpPrice: boolean | null;
  resolvedPrice: number | null;
}

const initState = {
  hasEmpPrice: null,
  resolvedPrice: null,
};

// Taken from Voting.sol implementation.
enum PRICE_REQUEST_STATUSES {
  NOT_REQUESTED, // Was never requested.
  ACTIVE, // Is being voted on in the current round.
  RESOLVED, // Was resolved in a previous round.
  FUTURE, // Is scheduled to be voted on in a future round.
}

const useContractState = () => {
  const { block$ } = Connection.useContainer();
  const { contract: dvm } = DvmContract.useContainer();
  const { empState } = EmpState.useContainer();
  const { priceIdentifier, expirationTimestamp } = empState;

  const [state, setState] = useState<ContractState>(initState);

  // get state from EMP
  const queryState = async () => {
    if (
      dvm !== null &&
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
      ]);

      const hasPrice = res[0][0].status === PRICE_REQUEST_STATUSES.RESOLVED;

      let resolvedPrice = null;
      if (hasPrice) {
        try {
          const postResolutionRes = await Promise.all([
            // `getPrice()` will fail on mainnet because the deployed `Voting.getPrice()` is required to be called from a registered contract, such as this EMP!
            // TODO: Figure out a way to spoof the `from` parameter in this contract call and set to `emp.address`. One possibility is via the UMA subgraph
            dvm.getPrice(
              priceIdentifier.toString(),
              expirationTimestamp.toNumber()
            ),
          ]);

          resolvedPrice = parseFloat(fromWei(postResolutionRes.toString()));
        } catch (err) {
          console.error(`getPrice failed:`, err);
        }
      }

      const newState: ContractState = {
        hasEmpPrice: hasPrice,
        resolvedPrice: resolvedPrice,
      };

      setState(newState);
    }
  };

  // get state on setting of contract
  useEffect(() => {
    setState(initState);

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
