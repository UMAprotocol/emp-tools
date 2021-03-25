// https://www.calculatorsoup.com/calculators/financial/compound-interest-calculator.php
// Calculates a compounding interest, leaving this in as potential useful function
export const calcInterest = (
  startPrice: number,
  endPrice: number,
  periodsRemaining: number,
  periods: number = 365.25
) => {
  return (
    periods *
    (Math.pow(
      endPrice / startPrice,
      1 / ((periodsRemaining / periods) * periods)
    ) -
      1)
  );
};
// https://www.omnicalculator.com/finance/apy#how-does-this-apy-calculator-work
// Calculates apy based on interest rate, not used, but leaving incase its useful
export const calcApy = (interest: number, periods: number = 365.25) => {
  return Math.pow(1 + interest / periods, periods) - 1;
};

// https://www.lexingtonlaw.com/credit/what-is-apr
// Used in the yield calculator, calculates non compounding APR
export const calcApr = (
  startPrice: number,
  endPrice: number,
  periodsRemaining: number = 1,
  periods = 365.25
) => {
  return ((endPrice - startPrice) / startPrice / periodsRemaining) * periods;
};

type DevMiningCalculatorParams = {
  ethers: any;
  getPrice: any;
  empAbi: any;
  erc20Abi: any;
  provider: any;
};
export function DevMiningCalculator({
  provider,
  ethers,
  getPrice,
  empAbi,
  erc20Abi,
}: DevMiningCalculatorParams) {
  const { utils, BigNumber, FixedNumber } = ethers;
  const { parseEther } = utils;
  async function getEmpInfo(address: string, toCurrency = "usd") {
    const emp = new ethers.Contract(address, empAbi, provider);
    const tokenAddress = await emp.tokenCurrency();
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const tokenPrice = await getPrice(tokenAddress, toCurrency).catch(
      () => null
    );
    const tokenCount = (await emp.totalTokensOutstanding()).toString();
    const tokenDecimals = (await tokenContract.decimals()).toString();

    const collateralAddress = await emp.collateralCurrency();
    const collateralContract = new ethers.Contract(
      collateralAddress,
      erc20Abi,
      provider
    );
    const collateralPrice = await getPrice(collateralAddress, toCurrency).catch(
      () => null
    );
    const collateralCount = (await emp.totalPositionCollateral()).toString();
    const collateralDecimals = (await collateralContract.decimals()).toString();
    const collateralRequirement = (
      await emp.collateralRequirement()
    ).toString();

    return {
      address,
      toCurrency,
      tokenAddress,
      tokenPrice,
      tokenCount,
      tokenDecimals,
      collateralAddress,
      collateralPrice,
      collateralCount,
      collateralDecimals,
      collateralRequirement,
    };
  }
  // returns a fixed number
  function calculateEmpValue({
    tokenPrice,
    tokenDecimals,
    collateralPrice,
    collateralDecimals,
    tokenCount,
    collateralCount,
    collateralRequirement,
  }: {
    tokenPrice: number;
    tokenDecimals: number;
    collateralPrice: number;
    collateralDecimals: number;
    tokenCount: number;
    collateralCount: number;
    collateralRequirement: number;
  }) {
    // if we have a token price, use this first to estimate EMP value
    if (tokenPrice) {
      const fixedPrice = FixedNumber.from(tokenPrice.toString());
      const fixedSize = FixedNumber.fromValue(tokenCount, tokenDecimals);
      return fixedPrice.mulUnsafe(fixedSize);
    }
    // if theres no token price then fallback to collateral price divided by the collateralization requirement (usually 1.2)
    // this should give a ballpack of what the total token value will be. Its still an over estimate though.
    if (collateralPrice) {
      const fixedPrice = FixedNumber.from(collateralPrice.toString());
      const collFixedSize = FixedNumber.fromValue(
        collateralCount,
        collateralDecimals
      );
      return fixedPrice
        .mulUnsafe(collFixedSize)
        .divUnsafe(FixedNumber.fromValue(collateralRequirement, 18));
    }
    throw new Error(
      "Unable to calculate emp value, no token price or collateral price"
    );
  }

  async function estimateDevMiningRewards({
    totalRewards,
    empWhitelist,
  }: {
    totalRewards: number;
    empWhitelist: string[];
  }) {
    const allInfo = await Promise.all(
      empWhitelist.map((address) => getEmpInfo(address))
    );

    const values: any[] = [];
    const totalValue = allInfo.reduce((totalValue, info) => {
      const value = calculateEmpValue(info);
      values.push(value);
      return totalValue.addUnsafe(value);
    }, FixedNumber.from("0"));

    return allInfo.map((info, i): [string, string] => {
      return [
        info.address,
        values[i]
          .mulUnsafe(FixedNumber.from(totalRewards))
          .divUnsafe(totalValue)
          .toString(),
      ];
    });
  }

  return {
    estimateDevMiningRewards,
    utils: {
      getEmpInfo,
      calculateEmpValue,
    },
  };
}
