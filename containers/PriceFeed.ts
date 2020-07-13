import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumber } from "ethers";

import { getOffchainPrice } from "../utils/getOffchainPrice";

import Token from "./Token";

function usePriceFeed() {
  const { symbol: tokenSymbol } = Token.useContainer();

  const [latestPrice, setLatestPrice] = useState<BigNumber | null>(null);

  const queryPrice = async () => {
    if (tokenSymbol) {
      const query = await getOffchainPrice(
        tokenSymbol.includes("yCOMP") ? "compusd" : "ethbtc"
      );
      setLatestPrice(query);
    }
  };

  // update price on setting of contract
  useEffect(() => {
    queryPrice();
  }, [tokenSymbol]);

  return {
    latestPrice,
  };
}

const PriceFeed = createContainer(usePriceFeed);

export default PriceFeed;
