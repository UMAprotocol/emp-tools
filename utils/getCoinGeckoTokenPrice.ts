// Simplest possible way to get the current UMA token price to calculate equivalent APR.
// TODO: Incorporate this into the `getOffchainPrice` util module.

export async function getUmaPrice() {
  const query =
    "https://api.coingecko.com/api/v3/simple/price?ids=uma&vs_currencies=usd";

  const response = await fetch(query, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  let priceResponse = await response.json();
  return priceResponse.uma.usd;
}

export async function getRenPrice() {
  const query =
    "https://api.coingecko.com/api/v3/simple/price?ids=republic-protocol&vs_currencies=usd";

  const response = await fetch(query, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  let priceResponse = await response.json();
  return priceResponse["republic-protocol"].usd;
}
