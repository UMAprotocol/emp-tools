// The keys in this object are the synthetic token. the `token0` and `token1` are
// the balancer pool key value pairs for the first and second token in the pool.
interface yieldPair {
  [key: string]: string;
}

interface yieldToken {
  [key: string]: yieldPair;
}

export const YIELD_TOKENS: yieldToken = {
  "0x81ab848898b5ffd3354dbbefb333d5d183eedcb5": {
    token0: "0x81ab848898b5ffd3354dbbefb333d5d183eedcb5",
    token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  }, // yUSDETH-SEP20
  "0xb2fdd60ad80ca7ba89b9bab3b5336c2601c020b4": {
    token0: "0xb2fdd60ad80ca7ba89b9bab3b5336c2601c020b4",
    token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  }, // yUSDETH-Oct20
  "0x208d174775dc39fe18b1b374972f77ddec6c0f73": {
    token0: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    token1: "0x208d174775dc39fe18b1b374972f77ddec6c0f73",
  }, // uUSDrBTC-OCT
  "0xd16c79c8a39d44b2f3eb45d2019cd6a42b03e2a9": {
    token0: "0xd16c79c8a39d44b2f3eb45d2019cd6a42b03e2a9",
    token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  }, // uUSDwETH-DEC
  "0xf06ddacf71e2992e2122a1a0168c6967afdf63ce": {
    token0: "0xf06ddacf71e2992e2122a1a0168c6967afdf63ce",
    token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  }, // uUSDrBTC-DEC
};
