import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumberish } from "ethers";

import {
  getOffchainPriceFromTokenSymbol,
  getIdentifierParamsFromTokenSymbol,
} from "../utils/getOffchainPrice";

import Token from "./Token";

function usePriceFeed() {
  const { symbol: tokenSymbol } = Token.useContainer();

  const [latestPrice, setLatestPrice] = useState<BigNumberish | null>(null);
  const [source, setSource] = useState<string | undefined>(undefined);

  const queryPrice = async () => {
    setLatestPrice(null);

    if (tokenSymbol) {
      const query = await getOffchainPriceFromTokenSymbol(tokenSymbol);
      setLatestPrice(query);
      setSource(getIdentifierParamsFromTokenSymbol(tokenSymbol)?.pricefeed);
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
