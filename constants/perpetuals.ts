import assert from "assert";
// hard coded perpetual info, until theres a better way to get this info
export const perpetuals = [
  {
    // this is a perp kovan contract
    name: "New Perpetual Contract Test",
    symbol: "NEW-PERP-TEST",
    address: "0x24d15f2607ee56dF752375a63e646cbF8E652aF3",
    // this is hardcoded to a mainnet uniswap eth usdc pair for now. But in the future we should be able
    // to derive the market or markets where the synthetic is being traded...
    market: {
      type: "uniswap",
      id: "0xbb2b8038a1640196fbe3e38816f3e67cba72d940",
      token0: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      token1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    },
  },
];

export function findInfoByName(name: string | undefined) {
  assert(name, "requires perpetual name");
  const result = perpetuals.find(
    (perp) => perp.name.toLowerCase() == name.toLowerCase()
  );
  assert(result, `Unable to find perp info by name: ${name}`);
  return result;
}

export function findInfoByAddress(address: string | undefined) {
  assert(address, "requires perpetual address");
  const result = perpetuals.find(
    (perp) => perp.address.toLowerCase() == address.toLowerCase()
  );
  assert(result, `Unable to find perp info by address: ${address}`);
  return result;
}
