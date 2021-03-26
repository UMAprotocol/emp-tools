import { getUmaPrice, getRenPrice } from "../utils/getCoinGeckoTokenPrice";

export const WEEKS_PER_YEAR = 52;
export const WEEKLY_UMA_REWARDS: { [tokenAddress: string]: any[] } = {
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
      endDate: Date.UTC(2020, 11, 28, 23, 0, 0, 0),
    },
  ], // uUSDwETH-DEC
  "0xf06ddacf71e2992e2122a1a0168c6967afdf63ce": [
    {
      token: "UMA",
      count: 10000,
      getPrice: getUmaPrice,
      startDate: Date.UTC(2020, 8, 23, 23, 0, 0, 0),
      endDate: Date.UTC(2020, 11, 28, 23, 0, 0, 0),
    },
    {
      token: "REN",
      count: 25000,
      getPrice: getRenPrice,
      startDate: Date.UTC(2020, 8, 23, 23, 0, 0, 0),
      endDate: Date.UTC(2020, 9, 1, 0, 0, 0),
    },
  ], // uUSDrBTC-DEC
  "0x90f802c7e8fb5d40b0de583e34c065a3bd2020d8": [
    {
      token: "UMA",
      count: 25000,
      getPrice: getUmaPrice,
      startDate: Date.UTC(2020, 11, 25, 23, 0, 0, 0),
      endDate: Date.UTC(2021, 3, 25, 23, 0, 0, 0),
    },
  ], // YD-ETH-MAR21
  "0x002f0b1a71c5730cf2f4da1970a889207bdb6d0d": [
    {
      token: "UMA",
      count: 10000,
      getPrice: getUmaPrice,
      startDate: Date.UTC(2020, 11, 25, 23, 0, 0, 0),
      endDate: Date.UTC(2021, 3, 25, 23, 0, 0, 0),
    },
  ], // YD-BTC-MAR21
  "0xcbe430927370e95b4b10cfc702c6017ec7abefc3": [
    {
      token: "UMA",
      count: 1,
      getPrice: getUmaPrice,
    },
  ], // YD-ETH-JUN21
  "0x4b7fb448df91c8ed973494f8c8c4f12daf3a8521": [
    {
      token: "UMA",
      count: 1,
      getPrice: getUmaPrice,
    },
  ], // YD-BTC-JUN21
};

// Key is roll from token address.
export const ROLL_REWARDS_SCHEDULE: { [key: string]: any } = {
  "0xd16c79c8a39d44b2f3eb45d2019cd6a42b03e2a9": {
    rollFromEmpAddress: "0x3605Ec11BA7bD208501cbb24cd890bC58D2dbA56",
    rollFromTokenName: "uUSDwETH-DEC",
    rollToTokenName: "YD-ETH-MAR21",
    rollToToken: "0x90f802c7e8fb5d40b0de583e34c065a3bd2020d8",
    rollStartDate: Date.UTC(2020, 11, 25, 23, 0, 0, 0),
    rollDate: Date.UTC(2020, 11, 28, 23, 0, 0, 0),
  }, // uUSDwETH-DEC --> YD-ETH-MAR21
  "0xf06ddacf71e2992e2122a1a0168c6967afdf63ce": {
    rollFromEmpAddress: "0xaBBee9fC7a882499162323EEB7BF6614193312e3",
    rollFromTokenName: "uUSDrBTC-DEC",
    rollToTokenName: "YD-BTC-MAR21",
    rollToToken: "0x002f0b1a71c5730cf2f4da1970a889207bdb6d0d",
    rollStartDate: Date.UTC(2020, 11, 25, 23, 0, 0, 0),
    rollDate: Date.UTC(2020, 11, 28, 23, 0, 0, 0),
  }, // uUSDrBTC-DEC --> YD-BTC-MAR21
  "0x90f802c7e8fb5d40b0de583e34c065a3bd2020d8": {
    rollFromEmpAddress: "0xE4256C47a3b27a969F25de8BEf44eCA5F2552bD5",
    rollToTokenName: "YD-ETH-JUN21",
    rollFromTokenName: "YD-ETH-MAR21",
    rollToToken: "0xcbe430927370e95b4b10cfc702c6017ec7abefc3",
    // utc months are 0 indexed, so subtract one from normal month number
    rollStartDate: Date.UTC(2021, 2, 25, 23, 0, 0, 0),
    rollDate: Date.UTC(2021, 2, 25, 23, 0, 0, 1),
  }, // YD-ETH-MAR21 => YD-ETH-JUN21
  "0xcbe430927370e95b4b10cfc702c6017ec7abefc3": {
    rollFromTokenName: "YD-BTC-MAR21",
    rollToTokenName: "YD-BTC-JUN21",
    rollFromEmpAddress: "0x1c3f1A342c8D9591D9759220d114C685FD1cF6b8",
    rollToToken: "0x4b7fb448df91c8ed973494f8c8c4f12daf3a8521",
    rollStartDate: Date.UTC(2021, 2, 25, 23, 0, 0, 0),
    rollDate: Date.UTC(2021, 2, 25, 23, 0, 0, 1),
  }, // YD-BTC-MAR21 => YD-BTC_JUN21
};
