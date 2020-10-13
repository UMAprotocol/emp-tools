// https://www.calculatorsoup.com/calculators/financial/compound-interest-calculator.php
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
export const calcApy = (interest: number, periods: number = 365.25) => {
  return Math.pow(1 + interest / periods, periods) - 1;
};
