// Simplest possible way to get the current UMA token price to calculate equivalent APR.
// TODO: Incorporate this into the `getOffchainPrice` util module.

// so this can be tested outside browser
import fetch from "isomorphic-fetch";
const fetchOptions = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    // sets a 10 minute cache, should prevent too many requests to CG
    "Cache-Control": "max-age=600",
  },
};

export async function getUmaPrice() {
  const query =
    "https://api.coingecko.com/api/v3/simple/price?ids=uma&vs_currencies=usd";

  const response = await fetch(query, fetchOptions);

  let priceResponse = await response.json();
  return priceResponse.uma.usd;
}

export async function getRenPrice() {
  const query =
    "https://api.coingecko.com/api/v3/simple/price?ids=republic-protocol&vs_currencies=usd";

  const response = await fetch(query, fetchOptions);

  let priceResponse = await response.json();
  return priceResponse["republic-protocol"].usd;
}

export async function getSimplePrice(
  fromCurrency: string,
  toCurrency: string = "usd"
) {
  const query = `https://api.coingecko.com/api/v3/simple/price?ids=${fromCurrency}&vs_currencies=${toCurrency}`;
  const response = await fetch(query, fetchOptions);
  let priceResponse = await response.json();
  return priceResponse[fromCurrency][toCurrency];
}

export async function getContractInfo(address: string) {
  let query = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`;
  // check for cBTC
  if (address == "0x6f2E5fF0932EDbba8239A99Cf68c246448683b24") {
    query = `https://api.coingecko.com/api/v3/coins/ethereum/contract/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599`;
  }
  // check for USDC
  if (address == "0x07865c6E87B9F70255377e024ace6630C1Eaa37F") {
    query = `https://api.coingecko.com/api/v3/coins/ethereum/contract/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`;
  }

  const response = await fetch(query, fetchOptions);
  const result = await response.json();
  if (result.error) throw new Error(result.error);
  return result;
}
// Returns price or undefined if not found. Wish there was a better way to do this to get instant price.
export async function getSimplePriceByContract(
  address: string,
  toCurrency: string = "usd"
) {
  const result = await getContractInfo(address);
  return (
    result && result.market_data && result.market_data.current_price[toCurrency]
  );
}
