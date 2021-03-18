import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getAbi } from "../utils/getAbi";
import { Contracts, ContractArguments } from "../utils/Contracts";
import assert from "assert";

import Connection from "./Connection";

type Provider = ethers.providers.Provider | ethers.Signer;

export interface ContractInfo {
  name: string;
  symbol: string;
  address: string;
  version: string;
  type: string;
}
export async function getUmaContractInfo(
  address: string,
  type: string,
  version: string,
  provider: Provider
) {
  const abi = getAbi(type, version);
  const contract = new ethers.Contract(address, abi, provider);
  const tokenAddr = await contract.tokenCurrency();
  return {
    address,
    contract,
    token: await getErc20Info(tokenAddr, provider),
    type,
    version,
  };
}
export async function getErc20Info(address: string, provider: Provider) {
  const abi = getAbi("erc20");
  const contract = new ethers.Contract(address, abi, provider);
  return {
    type: "Erc20",
    version: "latest",
    contract,
    address,
    name: await contract.name(),
    symbol: await contract.symbol(),
  };
}
export async function getAllUmaContractInfoByChain(
  chainid: number,
  provider: Provider
) {
  assert(Contracts[chainid], "Invalid chain id: " + chainid);
  return Promise.all(
    Contracts[chainid].map(([address, type, version]) => {
      return getUmaContractInfo(address, type, version, provider);
    })
  );
}

const useContractList = () => {
  const { signer, network } = Connection.useContainer();
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const getContractInfo = async (chainId: number, provider: Provider) => {
    const info = await getAllUmaContractInfoByChain(chainId, provider);
    // map this to what the contract selector wants
    return info.map((info) => {
      return {
        name: info.token.name,
        symbol: info.token.symbol,
        address: info.address,
        type: info.type,
        version: info.version,
      };
    });
  };

  const getByAddress = (address: string) => {
    return contracts.find((info) => {
      return info.address.toLowerCase() === address.toLowerCase();
    });
  };

  useEffect(() => {
    if (!signer || !network) return;
    setLoading(true);
    getContractInfo(network.chainId, signer)
      .then(setContracts)
      .catch((err) => console.error("Error loading contract info", err))
      .finally(() => setLoading(false));
  }, [signer, network]);

  return {
    contracts,
    getByAddress,
    loading,
  };
};

const ContractList = createContainer(useContractList);
export default ContractList;
