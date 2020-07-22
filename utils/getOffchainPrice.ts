interface IdentifierParams {
  identifier: string;
  invertedPrice: boolean;
  // TODO: This is a really simple mapping of identifier to URL to query to get latest price for an identifier.
  // Future work should blend off-chain prices from different sources similar to how we do it in
  // `protocol/financial-templates-lib/price-feed/MedianizerPriceFeed.js`
  pricefeed: string;
}

interface IdentifierParamsMap {
  [identifier: string]: IdentifierParams;
}

// TODO: Currently using the coinbase API instead of CryptoWatch because CryptoWatch has strict CORS
// policy that prevents requests coming from localhost domains.
export const IDENTIFIER_PARAMS: IdentifierParamsMap = {
  compusd: {
    identifier: "COMPUSD",
    invertedPrice: false,
    pricefeed: "https://api.pro.coinbase.com/products/COMP-USD/trades?limit=1",
  },
  ethbtc: {
    identifier: "ETH/BTC",
    invertedPrice: false,
    pricefeed: "https://api.pro.coinbase.com/products/ETH-BTC/trades?limit=1",
  },
  usdeth: {
    identifier: "USDETH",
    invertedPrice: true,
    pricefeed: "https://api.pro.coinbase.com/products/ETH-USD/trades?limit=1",
  },
};

export const getIdentifierParamsFromTokenSymbol = (symbol: string | null) => {
  switch (true) {
    case symbol?.includes("yCOMP"):
      return IDENTIFIER_PARAMS.compusd;
    case symbol?.includes("ETHBTC"):
      return IDENTIFIER_PARAMS.ethbtc;
    case symbol?.includes("yUSD"):
      return IDENTIFIER_PARAMS.usdeth;
    default:
      return null;
  }
};

export const getOffchainPriceFromTokenSymbol = async (symbol: string) => {
  let identifierParams = getIdentifierParamsFromTokenSymbol(symbol);
  if (!identifierParams) {
    console.error(
      `Missing identifier parameters for token with symbol ${symbol}`
    );
    return null;
  }
  try {
    const response = await fetch(identifierParams?.pricefeed);
    const json = await response.json();
    const price = json[0].price as number;
    if (identifierParams.invertedPrice) {
      return 1 / price;
    } else {
      return price;
    }
  } catch (err) {
    console.error(
      `Failed to get price for: ${identifierParams.identifier}:`,
      err
    );
    return null;
  }
};
