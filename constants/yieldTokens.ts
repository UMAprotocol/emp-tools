// The keys in this object are the synthetic token. the `token0` and `token1` are
// the balancer pool key value pairs for the first and second token in the pool.
interface yieldPair {
  [key: string]: string;
}

interface yieldToken {
  [key: string]: yieldPair;
}

// Note: The addresses in this struct need to be in lower case in order to match how the subgraph stores addresses:
// - (WRONG): 0x002f0B1A71C5730CF2F4dA1970A889207BdB6D0D
// - (CORRECT): 0x002f0b1a71c5730cf2f4da1970a889207bdb6d0d
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
  "0x90f802c7e8fb5d40b0de583e34c065a3bd2020d8": {
    token0: "0x90f802c7e8fb5d40b0de583e34c065a3bd2020d8",
    token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  }, // YD-ETH-MAR21
  "0x002f0b1a71c5730cf2f4da1970a889207bdb6d0d": {
    token0: "0x002f0b1a71c5730cf2f4da1970a889207bdb6d0d",
    token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  }, // YD-BTC-MAR21
};
