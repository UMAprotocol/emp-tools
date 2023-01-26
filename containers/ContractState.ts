import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";

import Connection from "./Connection";
import SelectedContract from "./SelectedContract";
import { getState } from "../utils/getAbi";

const initState = {
  expirationTimestamp: null,
  collateralCurrency: null,
  priceIdentifier: null,
  priceIdentifierUtf8: null,
  tokenCurrency: null,
  collateralRequirement: null,
  disputeBondPct: null,
  disputerDisputeRewardPct: null,
  sponsorDisputeRewardPct: null,
  minSponsorTokens: null,
  timerAddress: null,
  cumulativeFeeMultiplier: null,
  rawTotalPositionCollateral: null,
  totalTokensOutstanding: null,
  liquidationLiveness: null,
  withdrawalLiveness: null,
  currentTime: null,
  isExpired: null,
  contractState: null,
  finderAddress: null,
  expiryPrice: null,
  ancillaryData: null,
};

const useContractState = () => {
  const { block$, signer } = Connection.useContainer();
  const { contract } = SelectedContract.useContainer();

  const [data, setData] = useState<any>(initState);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  function updateState() {
    if (!contract || !signer) return;
    getState(contract, signer)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }
  // get state on setting of contract
  useEffect(() => {
    updateState();
  }, [contract, signer]);

  // get state on each block
  useEffect(() => {
    if (!block$) return;
    const sub = block$.subscribe(() => updateState());
    return () => sub.unsubscribe();
  }, [block$, signer, contract]);
  // expiration timestamp & expiry price are "null"

  return { data, error, loading };
};

export default createContainer(useContractState);
