import { getUmaPrice, getRenPrice } from "../utils/getCoinGeckoTokenPrice";

export const WEEKS_PER_YEAR = 52;
export const WEEKLY_UMA_REWARDS: { [key: string]: any[] } = {
  "0xb2fdd60ad80ca7ba89b9bab3b5336c2601c020b4": [
    {
      token: "UMA",
      count: 25000,
      getPrice: getUmaPrice,
      endDate: Date.UTC(2020, 8, 27, 23, 0, 0, 0),
    },
  ], // yUSDETH-Oct20
  "0x208d174775dc39fe18b1b374972f77ddec6c0f73": [
    {
      token: "UMA",
      count: 10000,
      getPrice: getUmaPrice,
      endDate: Date.UTC(2020, 8, 27, 23, 0, 0, 0),
    },
    {
      token: "REN",
      count: 25000,
      getPrice: getRenPrice,
      endDate: Date.UTC(2020, 8, 27, 23, 0, 0, 0),
    },
  ], // uUSDrBTC-OCT
  "0xd16c79c8a39d44b2f3eb45d2019cd6a42b03e2a9": [
    {
      token: "UMA",
      count: 25000,
      getPrice: getUmaPrice,
      startDate: Date.UTC(2020, 8, 23, 23, 0, 0, 0),
    },
  ], // uUSDwETH-DEC
  "0xf06ddacf71e2992e2122a1a0168c6967afdf63ce": [
    {
      token: "UMA",
      count: 10000,
      getPrice: getUmaPrice,
      startDate: Date.UTC(2020, 8, 23, 23, 0, 0, 0),
    },
    {
      token: "REN",
      count: 25000,
      getPrice: getRenPrice,
      startDate: Date.UTC(2020, 8, 23, 23, 0, 0, 0),
      endDate: Date.UTC(2020, 9, 1, 0, 0, 0),
    },
  ], // uUSDrBTC-DEC
};

// Key is roll from token address.
export const ROLL_REWARDS_SCHEDULE: { [key: string]: any } = {
  "0xb2fdd60ad80ca7ba89b9bab3b5336c2601c020b4": {
    rollFromTokenName: "yUSD-OCT20",
    rollToTokenName: "uUSDwETH-DEC",
    rollToToken: "0xd16c79c8a39d44b2f3eb45d2019cd6a42b03e2a9",
    rollStartDate: Date.UTC(2020, 8, 23, 23, 0, 0, 0),
    rollDate: Date.UTC(2020, 8, 27, 23, 0, 0, 0),
  }, // yUSDETH-Oct20 --> uUSDwETH-DEC
  "0x208d174775dc39fe18b1b374972f77ddec6c0f73": {
    rollFromTokenName: "uUSDrBTC-OCT",
    rollToTokenName: "uUSDrBTC-DEC",
    rollToToken: "0xf06ddacf71e2992e2122a1a0168c6967afdf63ce",
    rollStartDate: Date.UTC(2020, 8, 23, 23, 0, 0, 0),
    rollDate: Date.UTC(2020, 8, 27, 23, 0, 0, 0),
  }, // uUSDrBTC-OCT --> uUSDrBTC-DEC
};
