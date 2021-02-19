import {
  calcApy,
  calcInterest,
  calcApr,
  DevMiningCalculator,
} from "./calculators";
import {
  getSimplePrice,
  getContractInfo,
  getSimplePriceByContract,
} from "./getCoinGeckoTokenPrice";

import { ethers } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";
import uma from "@studydefi/money-legos/uma";

// results to compare calculated from https://www.omnicalculator.com/finance/apy#how-does-this-apy-calculator-work
// interest compared to https://www.calculatorsoup.com/calculators/financial/compound-interest-calculator.php
// slight deviations in calculations are based off days in year 365.25 vs 365
test("Interest", () => {
  let result;
  result = calcInterest(0.9, 1, 10);
  expect(result.toFixed(4)).toEqual("3.8686");

  result = calcInterest(1.1, 1, 10);
  expect(result.toFixed(4)).toEqual("-3.4647");
});
test("apy", () => {
  let interest = calcInterest(1.1, 1, 10);
  let result = calcApy(interest);
  expect(result.toFixed(4)).toEqual("-0.9692");

  interest = calcInterest(1.0763086495335126, 1, 79);
  result = calcApy(interest);
  expect(result.toFixed(4)).toEqual("-0.2882");

  interest = calcInterest(1, 1.0763086495335126, 79);
  result = calcApy(interest);
  expect(result.toFixed(4)).toEqual("0.4049");
});

// need a better way to validate these numbers, but formula is simple enough
// that manual inspection of results might be ok.
test("apr", () => {
  let result;
  result = calcApr(1, 1.1, 10);
  expect(result).toBeGreaterThan(0);
  result = calcApr(1.1, 1, 10);
  expect(result).toBeLessThan(0);

  result = calcApr(1.0763086495335126, 1, 79);
  expect(result).toBeLessThan(0);

  result = calcApr(1, 1.0763086495335126, 79);
  expect(result).toBeGreaterThan(0);
});

test("getCoinGeckoTokenPrice", async () => {
  const contracts = [
    "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D", // rBTC
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // wETH
    "0xeca82185adCE47f39c684352B0439f030f860318", // PERL
  ];
  for (let contract of contracts) {
    const result = await getSimplePriceByContract(contract);
    expect(result).toBeGreaterThan(0);
  }
});

test("DevMiningCalculator", async () => {
  const empWhitelist = [
    "0xaBBee9fC7a882499162323EEB7BF6614193312e3", // uUSDrBTC-DEC
    "0x3605Ec11BA7bD208501cbb24cd890bC58D2dbA56", // uUSDrWETH-DEC
    "0x306B19502c833C1522Fbc36C9dd7531Eda35862B", // pxUSD-OCT2020
    "0x3a93E863cb3adc5910E6cea4d51f132E8666654F", // pxUSD-DEC2020
    "0xE4256C47a3b27a969F25de8BEf44eCA5F2552bD5", // YD-ETH-MAR21
    "0x1c3f1A342c8D9591D9759220d114C685FD1cF6b8", // YD-BTC-MAR21
  ];
  const provider = ethers.getDefaultProvider();
  const dmc = DevMiningCalculator({
    ethers,
    getPrice: getSimplePriceByContract,
    erc20Abi: erc20.abi,
    empAbi: uma.expiringMultiParty.abi,
    provider,
  });
  for (let contract of empWhitelist) {
    const result = await dmc.utils.getEmpInfo(contract);
    expect(result.tokenCount).toBeTruthy();
    expect(result.tokenPrice).toBeTruthy();
    expect(result.collateralCount).toBeTruthy();
    expect(result.collateralPrice).toBeTruthy();
    expect(result.tokenDecimals).toBeTruthy();
    expect(result.collateralDecimals).toBeTruthy();
    const value = dmc.utils.calculateEmpValue(result);
    expect(value).toBeTruthy();
  }
  const rewards = await dmc.estimateDevMiningRewards({
    totalRewards: 50000,
    empWhitelist,
  });
  for (let contract of empWhitelist) {
    expect(new Map(rewards).get(contract)).toBeTruthy();
  }
}, 30000);
