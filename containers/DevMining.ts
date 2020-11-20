import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { DevMiningCalculator } from "../utils/calculators";
import { getSimplePriceByContract } from "../utils/getCoinGeckoTokenPrice";

import { ethers } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";
import uma from "@studydefi/money-legos/uma";

import Connection from "./Connection";

export const defaultEmpWhitelist = [
  "0xaBBee9fC7a882499162323EEB7BF6614193312e3",
  "0x3605Ec11BA7bD208501cbb24cd890bC58D2dbA56",
  "0x3a93E863cb3adc5910E6cea4d51f132E8666654F",
];

export const defaultTotalRewards = 50000;

const useDevMiningCalculator = ({
  totalRewards = defaultTotalRewards,
  empWhitelist = defaultEmpWhitelist,
} = {}) => {
  const { provider } = Connection.useContainer();
  const [devMiningRewards, setRewards] = useState<Map<string, string> | null>();
  const [devMiningCalculator, setCalculator] = useState<any | null>();

  useEffect(() => {
    if (provider == null) return;
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
