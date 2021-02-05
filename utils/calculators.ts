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
    const erc20 = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const size = (await emp.totalTokensOutstanding()).toString();
    let price = 1;
    try {
      // we try to get a price, or fallback to 1 dollar. this will not work in all situations.
      // better APR calculator coming soon.
      price = await getPrice(tokenAddress, toCurrency);
    } catch (err) {
      // Dont show error for now
      // console.error("Unable to get a price, falling back to $1", err);
    }
    const decimals = await erc20.decimals();

    return {
      address,
      toCurrency,
      tokenAddress,
      size,
      price,
      decimals,
    };
  }
  // returns a fixed number
  function calculateEmpValue({
    price,
    size,
    decimals,
  }: {
    price: number;
    size: string;
    decimals: number;
  }) {
    const fixedPrice = FixedNumber.from(price.toString());
    const fixedSize = FixedNumber.fromValue(size, decimals);
    return fixedPrice.mulUnsafe(fixedSize);
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
