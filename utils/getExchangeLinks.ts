interface TokenExchangeMap {
  [tokenSymbol: string]: number;
}

interface ExchangeNameMap {
  [exchangeType: number]: string;
}

export enum EXCHANGES {
  UNISWAP,
  BALANCER,
}

export const EXCHANGE_NAMES_MAP: ExchangeNameMap = {
  [EXCHANGES.UNISWAP]: "Uniswap",
  [EXCHANGES.BALANCER]: "Balancer",
};

// Returns a function for a given exchange that can be used to retrieve an exchange's specific swap URL for a chosen token.
interface ExchangeLinkMap {
  [exchangeEnum: number]: (params: any) => string;
}

// A mapping of synthetic tokens to the exchange where they can be traded.
export const TOKEN_TO_EXCHANGE_MAP: TokenExchangeMap = {
  ycomp: EXCHANGES.UNISWAP,
  ethbtc: EXCHANGES.UNISWAP,
  yusd: EXCHANGES.BALANCER,
};

export const EXCHANGE_LINK_MAP: ExchangeLinkMap = {
  [EXCHANGES.UNISWAP]: (tokenAddress) =>
    `https://app.uniswap.org/#/swap?outputCurrency=${tokenAddress}`,
  [EXCHANGES.BALANCER]: (tokenAddress) =>
    `https://balancer.exchange/#/swap/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/${tokenAddress}`,
  // This returns a Balancer exchange URL to buy `tokenAddress` and sell USDC, a well understood currency
};

export const getExchangeTypeFromTokenSymbol = (symbol: string | null) => {
  switch (true) {
    case symbol?.includes("yCOMP"):
      return TOKEN_TO_EXCHANGE_MAP.ycomp;
    case symbol?.includes("ETHBTC"):
      return TOKEN_TO_EXCHANGE_MAP.ethbtc;
    case symbol?.includes("yUSD"):
      return TOKEN_TO_EXCHANGE_MAP.yusd;
    default:
      return null;
  }
};

export const getExchangeInfo = (symbol: string | null) => {
  const exchangeType = getExchangeTypeFromTokenSymbol(symbol);
  if (exchangeType !== null) {
    return {
      name: EXCHANGE_NAMES_MAP[exchangeType],
      getExchangeUrl: EXCHANGE_LINK_MAP[exchangeType],
    };
  }
};
