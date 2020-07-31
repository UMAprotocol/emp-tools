import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { utils } from "ethers";

import Connection from "./Connection";
import Collateral from "./Collateral";

import DvmContract from "./DvmContract";
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
  const {
    votingContract: dvm,
    storeContract: store,
  } = DvmContract.useContainer();
  const { address: collAddress } = Collateral.useContainer();
  const { empState } = EmpState.useContainer();
  const { priceIdentifier, expirationTimestamp } = empState;
  const { empAddress } = EmpAddress.useContainer();

  const [state, setState] = useState<ContractState>(initState);

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
        dvm.hasPrice(
          priceIdentifier.toString(),
          expirationTimestamp.toNumber(),
          { from: empAddress }
        ),
        store.computeFinalFee(collAddress, { from: empAddress }),
      ]);

      const hasPrice = res[0] as boolean;
      const finalFee = parseFloat(fromWei(res[1][0].toString()));

      let resolvedPrice = null;
      if (hasPrice) {
        try {
          const postResolutionRes = await Promise.all([
            dvm.getPrice(
              priceIdentifier.toString(),
              expirationTimestamp.toNumber(),
              { from: empAddress }
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
        finalFee: finalFee,
      };

      setState(newState);
    }
  };

  // get state on setting of contract
  useEffect(() => {
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
