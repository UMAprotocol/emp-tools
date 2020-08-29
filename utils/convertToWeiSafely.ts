import { utils } from "ethers";
const { parseUnits: toWei } = utils;

const DEFAULT_PRECISION = 18;

// `toWeiSafe()` should always be used to convert floats into wei values
// before passing the result as a transaction arg, as Solidity cannot deal with non-Integers.
// If the argument to pass into `toWei()` has too much precision (specifically more than `precisionToUse`),
// then `toWei()` might return a string number with decimals, which Solidity cannot handle.
export function toWeiSafe(
  numberToConvertToWei: string,
  desiredPrecision?: number
) {
  const precisionToUse = desiredPrecision
    ? desiredPrecision
    : DEFAULT_PRECISION;
  return toWei(
    Number(numberToConvertToWei).toFixed(precisionToUse),
    precisionToUse
  );
}
