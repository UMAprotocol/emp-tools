import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumber, Bytes, ethers } from "ethers";

import Connection from "./Connection";
import SelectedContract from "./SelectedContract";
import EmpContract from "./EmpContract";
import EmpState from "./EmpState";
import { getAbi } from "../utils/getAbi";

type Provider = ethers.providers.Provider | ethers.Signer;

export async function getPerpetualState(address: string, provider: Provider) {
  const abi = getAbi("perpetual", "2");
  const contract = new ethers.Contract(address, abi, provider);
  return {
    fundingRate: await contract.fundingRate(),
    priceIdentifier: await contract.priceIdentifier(),
  };
}

type dataType = {
  fundingRate: {
    rate: BigNumber;
  };
  priceIdentifier: string;
};
const useContractState = () => {
  const { signer } = Connection.useContainer();
  const abi = getAbi("perpetual", "2");
  const { address, isValid } = SelectedContract.useContainer();
  const [state, setState] = useState<{
    data: dataType | null;
    error: Error | null;
  }>({ data: null, error: null });
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!isValid || !address || !signer) return;
    getPerpetualState(address, signer)
      .then((data) => {
        setState({ ...state, data });
      })
      .catch((error) => {
        setState({ ...state, error });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [address, isValid, signer]);

  return {
    ...state,
    loading,
  };
};

export default createContainer(useContractState);
