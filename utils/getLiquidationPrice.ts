export function getLiquidationPrice(
  collateral: number,
  tokens: number,
  crThreshold: number,
  inverted: boolean = false
) {
  if (tokens <= 0 || crThreshold <= 0 || collateral <= 0) {
    // If liquidation price is 0, then the position can always be liquidated (i.e. it is an invalid position).
    return 0;
  }

  // Solve for token price that would set the proposed CR == crThreshold.
  const liquidationPrice = collateral / tokens / crThreshold;
  return inverted ? 1 / liquidationPrice : liquidationPrice;
}
