import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers, BigNumber, Bytes, Contract } from "ethers";

import Connection from "./Connection";
import EmpContract from "./EmpContract";
import SelectedContract from "./SelectedContract";
import { ContractInfo } from "./ContractList";
import { getState, getAbi } from "../utils/getAbi";
import { ConvertDecimals } from "../utils/calculators";

const initState = {
  expirationTimestamp: null,
  collateralCurrency: null,
  priceIdentifier: null,
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
};

type Provider = ethers.providers.Provider | ethers.Signer;
const fixDecimals = (provider: Provider) => async (state: any) => {
  const ercAbi = getAbi("erc20");
  const tokenContract = new ethers.Contract(
    state.tokenCurrency,
    ercAbi,
    provider
  );
  const tokenDecimals = await tokenContract.decimals();
  const minSponsorTokens = ConvertDecimals(
    tokenDecimals,
    18
  )(state.minSponsorTokens);
  return {
    ...state,
    minSponsorTokens,
  };
};

const useContractState = () => {
  const { block$, signer } = Connection.useContainer();
  const { contract } = SelectedContract.useContainer();

  const [data, setData] = useState<any>(initState);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  function updateState() {
    if (!contract || !signer) return;
    setLoading(true);
    getState(contract, signer)
      .then(fixDecimals(signer))
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

  return { data, error, loading };
};

export default createContainer(useContractState);
