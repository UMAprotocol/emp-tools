import { utils } from "ethers";
const { parseUnits: toWei } = utils;

// Minimum precision for a token or collateral currency that this dApp can support
const MIN_TOKEN_PRECISION = 6;

// Invariant: `desiredPrecision >= MIN_TOKEN_PRECISION`.
// If `desiredPrecision < MIN_TOKEN_PRECISION`, then it is possible that
// the `toWei()` call will return a number with decimals.
// Therefore, `toWeiSafe()` should always be used to convert floats into wei values
// before passing the result as a transaction arg, as Solidity cannot deal with non-Integers.
export function toWeiSafe(
  numberToConvertToWei: string,
  desiredPrecision?: number
) {
  return toWei(
    Number(numberToConvertToWei).toFixed(MIN_TOKEN_PRECISION),
    desiredPrecision
  );
}
