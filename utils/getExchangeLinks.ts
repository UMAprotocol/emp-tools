import {
  getExchangeTypeFromTokenSymbol,
  EXCHANGE_NAMES_MAP,
  EXCHANGE_LINK_MAP,
} from "../constants/syntheticTokenToExchangeMap";

export const getExchangeInfo = (symbol: string | null) => {
  const exchangeType = getExchangeTypeFromTokenSymbol(symbol);
  if (exchangeType !== null) {
    return {
      name: EXCHANGE_NAMES_MAP[exchangeType],
      getExchangeUrl: EXCHANGE_LINK_MAP[exchangeType],
    };
  }
};
