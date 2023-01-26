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
  const { optimisticOracleContract } = DvmContracts.useContainer();
  const {
    address: collAddress,
    decimals: collDecimals,
  } = Collateral.useContainer();
  const { empState } = EmpState.useContainer();
  const { priceIdentifier, expirationTimestamp, ancillaryData } = empState;
  const { empAddress } = EmpAddress.useContainer();

  const [state, setState] = useState<ContractState>(initState);

  // get state from EMP
  const queryState = async () => {
    if (
      optimisticOracleContract !== null &&
      collAddress !== null &&
      collDecimals !== null &&
      priceIdentifier !== null &&
      expirationTimestamp !== null
    ) {
      /*
        Sumero Fix: voting.hasPrice() removed, Final fee hardcoded
      */
      // requester, identifier, timestamp, ancillary data
      const hasPriceResult = await optimisticOracleContract.hasPrice(
        empAddress,
        priceIdentifier.toString(),
        expirationTimestamp.toNumber(),
        ancillaryData,
        { from: empAddress }
      );
      const hasPrice = hasPriceResult as boolean;
      const finalFee = parseFloat(fromWei("0", collDecimals));
      let resolvedPrice = null;

      /*
        Sumero Fix: store.getPrice() converted to optimisticOracle.getRequest()
      */

      /* 
      {
      optimisticOracleContract.getRequest() returns:
      address proposer; // Address of the proposer.
      address disputer; // Address of the disputer.
      IERC20 currency; // ERC20 token used to pay rewards and fees.
      bool settled; // True if the request is settled.
      bool refundOnDispute; // True if the requester should be refunded their reward on dispute.
      int256 proposedPrice; // Price that the proposer submitted.
      int256 resolvedPrice; // Price resolved once the request is settled.
      uint256 expirationTime; // Time at which the request auto-settles without a dispute.
      uint256 reward; // Amount of the currency to pay to the proposer on settlement.
      uint256 finalFee; // Final fee to pay to the Store upon request to the DVM.
      uint256 bond; // Bond that the proposer and disputer must pay on top of the final fee.
      uint256 customLiveness; // Custom liveness value set by the requester.
      }
      */

      if (hasPrice) {
        try {
          const postResolutionRes = await optimisticOracleContract.getRequest(
            empAddress,
            priceIdentifier.toString(),
            expirationTimestamp.toNumber(),
            ancillaryData,
            { from: empAddress }
          );
          resolvedPrice = parseFloat(
            fromWei(postResolutionRes[6].toString(), collDecimals)
          );
        } catch (err) {
          console.error(`OO getRequest failed:`, err);
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
  }, [optimisticOracleContract, priceIdentifier, expirationTimestamp]);

  // get state on each block
  useEffect(() => {
    console.log("Oo state called....");
    if (block$) {
      const sub = block$.subscribe(() => queryState());
      return () => sub.unsubscribe();
    }
  }, [block$, optimisticOracleContract]);

  return { ooState: state };
};

const OoState = createContainer(useContractState);

export default OoState;
