import { calcApy, calcInterest, calcApr } from "./calculators";

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
