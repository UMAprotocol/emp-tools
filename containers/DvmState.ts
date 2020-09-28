import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { utils } from "ethers";

import Connection from "./Connection";
import Collateral from "./Collateral";

import DvmContracts from "./DvmContracts";
import EmpState from "./EmpState";
import EmpAddress from "./EmpAddress";

const { formatUnits: fromWei } = utils;

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

const useContractState = () => {
  const { block$ } = Connection.useContainer();
  const { votingContract, storeContract } = DvmContracts.useContainer();
  const {
    address: collAddress,
    decimals: collDecimals,
  } = Collateral.useContainer();
  const { empState } = EmpState.useContainer();
  const { priceIdentifier, expirationTimestamp } = empState;
  const { empAddress } = EmpAddress.useContainer();

  const [state, setState] = useState<ContractState>(initState);

  // get state from EMP
  const queryState = async () => {
    if (
      votingContract !== null &&
      storeContract !== null &&
      collAddress !== null &&
      collDecimals !== null &&
      priceIdentifier !== null &&
      expirationTimestamp !== null
    ) {
      const [hasPriceResult, finalFeeResult] = await Promise.all([
        votingContract.hasPrice(
          priceIdentifier.toString(),
          expirationTimestamp.toNumber(),
          { from: empAddress }
        ),
        storeContract.computeFinalFee(collAddress),
      ]);

      const hasPrice = hasPriceResult as boolean;
      const finalFee = parseFloat(
        fromWei(finalFeeResult[0].toString(), collDecimals)
      );

      let resolvedPrice = null;
      if (hasPrice) {
        try {
          const postResolutionRes = await Promise.all([
            votingContract.getPrice(
              priceIdentifier.toString(),
              expirationTimestamp.toNumber(),
              { from: empAddress }
            ),
          ]);
          // Important assumption we make: the price identifier's resolved price has the same
          // precision as the collateral currency.
          resolvedPrice = parseFloat(
            fromWei(postResolutionRes.toString(), collDecimals)
          );
        } catch (err) {
          console.error(`getPrice failed:`, err);
        }
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
    queryState();
  }, [votingContract, storeContract, priceIdentifier, expirationTimestamp]);

  // get state on each block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => queryState());
      return () => sub.unsubscribe();
    }
  }, [block$, votingContract, storeContract]);

  return { dvmState: state };
};

const DvmState = createContainer(useContractState);

export default DvmState;
