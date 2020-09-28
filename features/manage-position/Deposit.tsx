import { useState } from "react";
import styled from "styled-components";
import { Box, Button, TextField, Typography, Grid } from "@material-ui/core";
import { utils } from "ethers";

import EmpContract from "../../containers/EmpContract";
import EmpState from "../../containers/EmpState";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import Position from "../../containers/Position";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";

import { getLiquidationPrice } from "../../utils/getLiquidationPrice";
import { isPricefeedInvertedFromTokenSymbol } from "../../utils/getOffchainPrice";
import { toWeiSafe } from "../../utils/convertToWeiSafely";

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const { formatUnits: fromWei, parseBytes32String: hexToUtf8 } = utils;

const Deposit = () => {
  const { contract: emp } = EmpContract.useContainer();
  const { empState } = EmpState.useContainer();
  const { symbol: tokenSymbol } = Token.useContainer();
  const {
    symbol: collSymbol,
    balance: collBalance,
    decimals: collDec,
    allowance: collAllowance,
    setMaxAllowance,
  } = Collateral.useContainer();
  const {
    tokens: posTokensString,
    collateral: posCollString,
    pendingWithdraw,
  } = Position.useContainer();
  const { latestPrice } = PriceFeed.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();
  const { collateralRequirement: collReq, priceIdentifier } = empState;

  const [collateral, setCollateral] = useState<string>("0");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  if (
    posCollString !== null &&
    posTokensString !== null &&
    pendingWithdraw !== null &&
    collAllowance !== null &&
    collBalance !== null &&
    latestPrice !== null &&
    emp !== null &&
    collReq !== null &&
    collDec !== null &&
    priceIdentifier !== null &&
    tokenSymbol !== null &&
    collSymbol !== null &&
    Number(posCollString) > 0 // If position has no collateral, then don't render deposit component.
  ) {
    const collateralToDeposit = Number(collateral) || 0;
    const priceIdentifierUtf8 = hexToUtf8(priceIdentifier);
    const hasPendingWithdraw = pendingWithdraw === "Yes";
    const collReqFromWei = parseFloat(fromWei(collReq));
    const posTokens = Number(posTokensString);
    const posColl = Number(posCollString);
    const resultantCollateral = posColl + collateralToDeposit;
    const resultantCR = posTokens > 0 ? resultantCollateral / posTokens : 0;
    const pricedResultantCR =
      latestPrice !== 0 ? (resultantCR / latestPrice).toFixed(4) : "0";
    const resultantLiquidationPrice = getLiquidationPrice(
      resultantCollateral,
      posTokens,
      collReqFromWei,
      isPricefeedInvertedFromTokenSymbol(tokenSymbol)
    ).toFixed(4);

    // Error conditions for calling deposit:
    const balanceBelowCollateralToDeposit = collBalance < collateralToDeposit;
    const needAllowance =
      collAllowance !== "Infinity" && collAllowance < collateralToDeposit;

    const depositCollateral = async () => {
      if (collateralToDeposit > 0) {
        setHash(null);
        setSuccess(null);
        setError(null);
        try {
          const collateralToDepositWei = toWeiSafe(collateral, collDec);
          const tx = await emp.deposit([collateralToDepositWei]);
          setHash(tx.hash as string);
          await tx.wait();
          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setError(new Error("Collateral amount must be positive."));
      }
    };

    if (hasPendingWithdraw) {
      return (
        <Box>
          <Box py={2}>
            <Typography>
              <i>
                You need to cancel or execute your pending withdrawal request
                before depositing additional collateral.
              </i>
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <Box>
        <Box pt={2} pb={4}>
          <Typography>
            Adding additional collateral into your position will increase your
            collateralization ratio.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item md={4} sm={6} xs={12}>
            <Box py={0}>
              <TextField
                fullWidth
                type="number"
                variant="outlined"
                inputProps={{ min: "0", max: collBalance }}
                label={`Collateral (${collSymbol})`}
                error={balanceBelowCollateralToDeposit}
                helperText={
                  balanceBelowCollateralToDeposit &&
                  `Your ${collSymbol} balance too low`
                }
                value={collateral}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCollateral(e.target.value)
                }
              />
            </Box>
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <Box py={0}>
              {needAllowance && (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={setMaxAllowance}
                  style={{ marginRight: `12px` }}
                >
                  Max Approve
                </Button>
              )}
              {!needAllowance && (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={depositCollateral}
                  disabled={
                    balanceBelowCollateralToDeposit || collateralToDeposit <= 0
                  }
                >
                  {`Deposit ${collateralToDeposit} ${collSymbol} into your position`}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        <Box py={4}>
          <Typography>{`Resulting CR: ${pricedResultantCR}`}</Typography>
          <Typography>
            {`Resulting liquidation price: ${resultantLiquidationPrice} (${priceIdentifierUtf8})`}
          </Typography>
        </Box>

        {hash && (
          <Box py={2}>
            <Typography>
              <strong>Tx Hash: </strong>
              {hash ? (
                <Link
                  href={getEtherscanUrl(hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {hash}
                </Link>
              ) : (
                hash
              )}
            </Typography>
          </Box>
        )}
        {success && (
          <Box py={2}>
            <Typography>
              <strong>Transaction successful!</strong>
            </Typography>
          </Box>
        )}
        {error && (
          <Box py={2}>
            <Typography>
              <span style={{ color: "red" }}>{error.message}</span>
            </Typography>
          </Box>
        )}
      </Box>
    );
  } else {
    return (
      <Box>
        <Box py={2}>
          <Typography>
            <i>Create a position before depositing more collateral.</i>
          </Typography>
        </Box>
      </Box>
    );
  }
};

export default Deposit;
