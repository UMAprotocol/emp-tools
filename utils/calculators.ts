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
