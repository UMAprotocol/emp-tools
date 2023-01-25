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
  BALANCERBTC,
}

export const EXCHANGE_NAMES_MAP: ExchangeNameMap = {
  [EXCHANGES.UNISWAP]: "Uniswap",
  [EXCHANGES.BALANCER]: "Balancer",
  [EXCHANGES.BALANCERBTC]: "Balancer",
};
/*
SUMERO FIX: usdbtc added
*/
// Maps synthetic tokens to the exchange where they and their collateral can be traded.
const TOKEN_TO_EXCHANGE_MAP: TokenExchangeMap = {
  ycomp: EXCHANGES.UNISWAP,
  ethbtc: EXCHANGES.UNISWAP,
  usdbtc: EXCHANGES.UNISWAP,
  yusd: EXCHANGES.BALANCER,
  mariocash: EXCHANGES.BALANCERBTC,
  pxusd: EXCHANGES.BALANCER,
  oocean: EXCHANGES.BALANCER,
  yuma: EXCHANGES.UNISWAP,
  openeth: EXCHANGES.BALANCER,
};

// Maps exchange types to functions that can be used to retrieve the exchange's swap URL for a chosen token.
export const EXCHANGE_LINK_MAP: ExchangeLinkMap = {
  [EXCHANGES.UNISWAP]: (tokenAddress) =>
    `https://app.uniswap.org/#/swap?outputCurrency=${tokenAddress}`,
  [EXCHANGES.BALANCER]: (tokenAddress) =>
    `https://balancer.exchange/#/swap/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/${tokenAddress}`,
  [EXCHANGES.BALANCERBTC]: (tokenAddress) =>
    `https://balancer.exchange/#/swap/0xeb4c2781e4eba804ce9a9803c67d0893436bb27d/${tokenAddress}`,
  // Since two currencies must be specified to the Balancer server,
  // This returns a Balancer exchange URL to swap `tokenAddress` and sell USDC, a well understood currency
};
/*
SUMERO FIX: case BTC added
*/
// Returns a mapping from synthetic token to the type of exchange on which you can acquire the chosen token
export const getExchangeTypeFromTokenSymbol = (symbol: string | null) => {
  switch (true) {
    case symbol?.includes("yCOMP"):
      return TOKEN_TO_EXCHANGE_MAP.ycomp;
    case symbol?.includes("ETHBTC"):
      return TOKEN_TO_EXCHANGE_MAP.ethbtc;
    case symbol?.includes("yUSD"):
      return TOKEN_TO_EXCHANGE_MAP.yusd;
    case symbol?.includes("uUSD"):
      return TOKEN_TO_EXCHANGE_MAP.yusd;
    case symbol?.includes("YD"):
      return TOKEN_TO_EXCHANGE_MAP.yusd;
    case symbol?.includes("Mario"):
      return TOKEN_TO_EXCHANGE_MAP.mariocash;
    case symbol?.includes("pxUSD"):
      return TOKEN_TO_EXCHANGE_MAP.pxusd;
    case symbol?.includes("OCEAN"):
      return TOKEN_TO_EXCHANGE_MAP.oocean;
    case symbol?.includes("yUMA"):
      return TOKEN_TO_EXCHANGE_MAP.yuma;
    case symbol?.includes("O-ETH"):
      return TOKEN_TO_EXCHANGE_MAP.openeth;
    case symbol?.includes("BTC"):
      return TOKEN_TO_EXCHANGE_MAP.usdbtc;
    default:
      return null;
  }
};
