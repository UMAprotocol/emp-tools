import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { DevMiningCalculator } from "../utils/calculators";
import { getSimplePriceByContract } from "../utils/getCoinGeckoTokenPrice";

import { ethers } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";
import uma from "@studydefi/money-legos/uma";

import Connection from "./Connection";

export const defaultTotalRewards = 50000;
const empStatusUrl =
  "https://raw.githubusercontent.com/UMAprotocol/protocol/master/packages/affiliates/payouts/devmining-status.json";

const useDevMiningCalculator = () => {
  const { provider } = Connection.useContainer();
  const [devMiningRewards, setRewards] = useState<Map<string, string> | null>();
  const [devMiningCalculator, setCalculator] = useState<any | null>();
  const [empWhitelist, setEmpWhitelist] = useState<string[]>();
  const [totalRewards, setTotalRewards] = useState<number>(defaultTotalRewards);

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
    const devMiningCalculator = DevMiningCalculator({
      ethers,
      getPrice: getSimplePriceByContract,
      erc20Abi: erc20.abi,
      empAbi: uma.expiringMultiParty.abi,
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
        console.error(err, "Error calculating dev mining rewards");
      });
  }, [provider, totalRewards, empWhitelist]);

  return {
    devMiningCalculator,
    devMiningRewards,
  };
};

export default createContainer(useDevMiningCalculator);
