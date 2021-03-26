import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { DevMiningCalculator } from "../utils/calculators";
import { getSimplePriceByContract } from "../utils/getCoinGeckoTokenPrice";
import SelectedContract from "./SelectedContract";

import { ethers } from "ethers";
import { getAbi } from "../utils/getAbi";

import Connection from "./Connection";

export const defaultTotalRewards = 50000;
const empStatusUrl =
  "https://raw.githubusercontent.com/UMAprotocol/protocol/master/packages/affiliates/payouts/devmining-status.json";

const useDevMiningCalculator = () => {
  const { provider } = Connection.useContainer();
  const { contract } = SelectedContract.useContainer();
  const [devMiningRewards, setRewards] = useState<Map<string, string> | null>();
  const [devMiningCalculator, setCalculator] = useState<any | null>(null);
  const [empWhitelist, setEmpWhitelist] = useState<string[]>();
  const [totalRewards, setTotalRewards] = useState<number>(defaultTotalRewards);
  const [error, setError] = useState<Error | null>(null);

  // pull latest whitelist
  useEffect(() => {
    fetch(empStatusUrl)
      .then((response) => response.json())
      .then((result) => {
        setEmpWhitelist(result.empWhitelist);
        setTotalRewards(result.totalReward);
      })
      .catch((err) => {
        console.error("Error fetching Affiliates status", err);
      });
  }, []);

  useEffect(() => {
    if (provider == null) return;
    if (empWhitelist == null) return;
    if (totalRewards == null) return;
    if (error) setError(null);
    // only run this once. allow user to retry by switching contracts
    if (devMiningRewards) return;
    const devMiningCalculator = DevMiningCalculator({
      ethers,
      getPrice: getSimplePriceByContract,
      erc20Abi: getAbi("erc20"),
      empAbi: getAbi("emp"),
      provider,
    });
    setCalculator(devMiningCalculator);

    devMiningCalculator
      .estimateDevMiningRewards({
        totalRewards,
        empWhitelist,
      })
      .then((rewards) => setRewards(new Map(rewards)))
      .catch((err) => {
        setError(err);
        console.error(err, "Error calculating dev mining rewards");
      });
  }, [provider, totalRewards, empWhitelist, contract]);

  return {
    error,
    devMiningCalculator,
    devMiningRewards,
  };
};

export default createContainer(useDevMiningCalculator);
