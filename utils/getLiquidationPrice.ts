export function getLiquidationPrice(
  collateral: number | null,
  tokens: number | null,
  crThreshold: number | null
) {
  if (
    tokens === 0 ||
    crThreshold === 0 ||
    !collateral ||
    !tokens ||
    !crThreshold
  ) {
    return null;
  }

  // Solve for token price that would set the proposed CR == crThreshold.
  const liquidationPrice = collateral / tokens / crThreshold;
  return liquidationPrice;
}
