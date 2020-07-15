import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumber } from "ethers";

import { getOffchainPrice, PRICE_FEEDS } from "../utils/getOffchainPrice";

import Token from "./Token";

function usePriceFeed() {
  const { symbol: tokenSymbol } = Token.useContainer();

  const [latestPrice, setLatestPrice] = useState<BigNumber | null>(null);
  const [source, setSource] = useState<string | undefined>(undefined);

  const queryPrice = async () => {
    if (tokenSymbol) {
      const identifier = tokenSymbol.includes("yCOMP") ? "compusd" : "ethbtc";
      const query = await getOffchainPrice(identifier);
      setLatestPrice(query);
      setSource(PRICE_FEEDS[identifier]);
    }
  };

  // update price on setting of contract
  useEffect(() => {
    queryPrice();
  }, [tokenSymbol]);

  return {
    latestPrice,
    sourceUrl: source,
  };
}

const PriceFeed = createContainer(usePriceFeed);

export default PriceFeed;
