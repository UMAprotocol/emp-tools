interface PricefeedParams {
  invertedPrice: boolean;
  // TODO: This is a really simple mapping of identifier to URL to query to get latest price for an identifier.
  // Future work should blend off-chain prices from different sources similar to how we do it in
  // `protocol/financial-templates-lib/price-feed/MedianizerPriceFeed.js`
  source: string;
}

interface PricefeedParamsMap {
  [identifier: string]: PricefeedParams;
}

// TODO: Currently using the coinbase API instead of CryptoWatch because CryptoWatch has strict CORS
// policy that prevents requests coming from localhost domains.
export const PRICEFEED_PARAMS: PricefeedParamsMap = {
  compusd: {
    invertedPrice: false,
    source: "https://api.pro.coinbase.com/products/COMP-USD/trades?limit=1",
  },
  ethbtc: {
    invertedPrice: false,
    source: "https://api.pro.coinbase.com/products/ETH-BTC/trades?limit=1",
  },
  usdeth: {
    invertedPrice: true,
    source: "https://api.pro.coinbase.com/products/ETH-USD/trades?limit=1",
  },
};

export const getPricefeedParamsFromTokenSymbol = (symbol: string | null) => {
  // This returns whichever "case" expression matches the conditional in `switch`.
  // In this case, whichever "case" expression evaluates to "true".
  // Source: https://stackoverflow.com/questions/4082204/javascript-conditional-switch-statement
  switch (true) {
    case symbol?.includes("yCOMP"):
      return PRICEFEED_PARAMS.compusd;
    case symbol?.includes("ETHBTC"):
      return PRICEFEED_PARAMS.ethbtc;
    case symbol?.includes("yUSD"):
      return PRICEFEED_PARAMS.usdeth;
    default:
      return null;
  }
};

export const getOffchainPriceFromTokenSymbol = async (symbol: string) => {
  let identifierParams = getPricefeedParamsFromTokenSymbol(symbol);
  if (!identifierParams) {
    console.error(
      `Missing identifier parameters for token with symbol ${symbol}`
    );
    return null;
  }
  try {
    const response = await fetch(identifierParams.source);
    const json = await response.json();
    const price = json[0].price as number;
    if (identifierParams.invertedPrice) {
      return 1 / price;
    } else {
      return price;
    }
  } catch (err) {
    console.error(
      `Failed to get price for for token with symbol ${symbol}`,
      err
    );
    return null;
  }
};
