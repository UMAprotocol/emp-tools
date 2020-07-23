interface TokenExchangeMap {
  [tokenSymbol: string]: number;
}

interface ExchangeNameMap {
  [exchangeType: number]: string;
}

interface ExchangeLinkMap {
  [exchangeEnum: number]: (params: any) => string;
}

enum EXCHANGES {
  UNISWAP,
  BALANCER,
}

const EXCHANGE_NAMES_MAP: ExchangeNameMap = {
  [EXCHANGES.UNISWAP]: "Uniswap",
  [EXCHANGES.BALANCER]: "Balancer",
};

// Maps synthetic tokens to the exchange where they and their collateral can be traded.
const TOKEN_TO_EXCHANGE_MAP: TokenExchangeMap = {
  ycomp: EXCHANGES.UNISWAP,
  ethbtc: EXCHANGES.UNISWAP,
  yusd: EXCHANGES.BALANCER,
};

// Maps exchange types to functions that can be used to retrieve the exchange's swap URL for a chosen token.
const EXCHANGE_LINK_MAP: ExchangeLinkMap = {
  [EXCHANGES.UNISWAP]: (tokenAddress) =>
    `https://app.uniswap.org/#/swap?outputCurrency=${tokenAddress}`,
  [EXCHANGES.BALANCER]: (tokenAddress) =>
    `https://balancer.exchange/#/swap/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/${tokenAddress}`,
  // Since two currencies must be specified to the Balancer server,
  // This returns a Balancer exchange URL to swap `tokenAddress` and sell USDC, a well understood currency
};

const _getExchangeTypeFromTokenSymbol = (symbol: string | null) => {
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
  const exchangeType = _getExchangeTypeFromTokenSymbol(symbol);
  if (exchangeType !== null) {
    return {
      name: EXCHANGE_NAMES_MAP[exchangeType],
      getExchangeUrl: EXCHANGE_LINK_MAP[exchangeType],
    };
  }
};
