import { useState } from "react";
import styled from "styled-components";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Tooltip,
  LinearProgress,
} from "@material-ui/core";
import { utils } from "ethers";

import EmpState from "../../containers/EmpState";
import EmpContract from "../../containers/EmpContract";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import Position from "../../containers/Position";
import Totals from "../../containers/Totals";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";

import { getLiquidationPrice } from "../../utils/getLiquidationPrice";
import { isPricefeedInvertedFromTokenSymbol } from "../../utils/getOffchainPrice";
import { DOCS_MAP } from "../../constants/docLinks";
import { toWeiSafe } from "../../utils/convertToWeiSafely";

const Important = styled(Typography)`
  color: red;
  background: black;
  display: inline-block;
`;

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const { formatUnits: fromWei, parseBytes32String: hexToUtf8 } = utils;

const Withdraw = () => {
  const { empState } = EmpState.useContainer();
  const {
    collateralRequirement: collReq,
    withdrawalLiveness,
    currentTime,
    priceIdentifier,
    isExpired,
  } = empState;

  const { contract: emp } = EmpContract.useContainer();
  const { symbol: tokenSymbol } = Token.useContainer();
  const { symbol: collSymbol, decimals: collDec } = Collateral.useContainer();
  const {
    tokens: posTokensString,
    collateral: posCollString,
    withdrawAmt: withdrawAmtString,
    withdrawPassTime,
    pendingWithdraw,
  } = Position.useContainer();
  const { gcr } = Totals.useContainer();
  const { latestPrice } = PriceFeed.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();
  const liquidationPriceWarningThreshold = 0.1;

  const [collateral, setCollateral] = useState<string>("0");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  if (
    isExpired !== null &&
    collateral !== null &&
    emp !== null &&
    collDec !== null &&
    collReq !== null &&
    posCollString !== null &&
    posTokensString !== null &&
    gcr !== null &&
    withdrawPassTime !== null &&
    withdrawalLiveness !== null &&
    withdrawAmtString !== null &&
    pendingWithdraw !== null &&
    currentTime !== null &&
    latestPrice !== null &&
    priceIdentifier !== null &&
    collSymbol !== null &&
    tokenSymbol !== null &&
    Number(posCollString) > 0 // If position has no collateral, then don't render withdraw component.
  ) {
    const collateralToWithdraw = Number(collateral) || 0;
    const collReqFromWei = parseFloat(fromWei(collReq));
    const priceIdentifierUtf8 = hexToUtf8(priceIdentifier);
    const prettyLatestPrice = Number(latestPrice).toFixed(4);
    const posTokens = Number(posTokensString);
    const posColl = Number(posCollString);
    const withdrawAmt = Number(withdrawAmtString);

    // CR data:
    const resultantCollateral = posColl - collateralToWithdraw;
    const resultantCR = posTokens > 0 ? resultantCollateral / posTokens : 0;
    const resultantCRBelowGCR = resultantCR < gcr;
    const pricedResultantCR =
      latestPrice !== 0 ? (resultantCR / latestPrice).toFixed(4) : "0";
    const pricedGCR = latestPrice !== 0 ? (gcr / latestPrice).toFixed(4) : null;
    const resultantLiquidationPrice = getLiquidationPrice(
      resultantCollateral,
      posTokens,
      collReqFromWei,
      isPricefeedInvertedFromTokenSymbol(tokenSymbol)
    ).toFixed(4);
    const liquidationPriceDangerouslyFarBelowCurrentPrice =
      parseFloat(resultantLiquidationPrice) <
      (1 - liquidationPriceWarningThreshold) * latestPrice;

    // Fast withdrawal amount: can withdraw instantly as long as CR > GCR
    const fastWithdrawableCollateral =
      posColl > gcr * posTokens ? (posColl - gcr * posTokens).toFixed(4) : "0";

    // Pending withdrawal request information:
    const withdrawLivenessString = Math.floor(
      Number(withdrawalLiveness) / (60 * 60)
    );
    const hasPendingWithdraw = pendingWithdraw === "Yes";
    const pendingWithdrawTimeRemaining = withdrawPassTime - Number(currentTime);
    const progressBarPercent =
      pendingWithdrawTimeRemaining > 0
        ? ((Number(withdrawalLiveness) - pendingWithdrawTimeRemaining) /
            Number(withdrawalLiveness)) *
          100
        : 100;
    const canExecutePendingWithdraw =
      hasPendingWithdraw && pendingWithdrawTimeRemaining <= 0;
    const pendingWithdrawTimeString =
      pendingWithdrawTimeRemaining > 0
        ? Math.max(0, Math.floor(pendingWithdrawTimeRemaining / 3600)) +
          ":" +
          (
            "00" +
            Math.max(0, Math.floor((pendingWithdrawTimeRemaining % 3600) / 60))
          ).slice(-2) +
          ":" +
          (
            "00" + Math.max(0, (pendingWithdrawTimeRemaining % 3600) % 60)
          ).slice(-2)
        : "None";

    // Error conditions for calling withdraw:
    const resultantCRBelowRequirement =
      parseFloat(pricedResultantCR) >= 0 &&
      parseFloat(pricedResultantCR) < collReqFromWei;
    const withdrawAboveBalance = collateralToWithdraw > posColl;

    const withdrawCollateral = async () => {
      if (collateralToWithdraw > 0) {
        setHash(null);
        setSuccess(null);
        setError(null);
        try {
          const collateralToWithdrawWei = toWeiSafe(collateral, collDec);
          if (resultantCRBelowGCR) {
            const tx = await emp.requestWithdrawal([collateralToWithdrawWei]);
            setHash(tx.hash as string);
            await tx.wait();
          } else {
            const tx = await emp.withdraw([collateralToWithdrawWei]);
            setHash(tx.hash as string);
            await tx.wait();
          }
          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setError(new Error("Collateral amount must be positive."));
      }
    };

    const executeWithdraw = async () => {
      if (canExecutePendingWithdraw) {
        setHash(null);
        setSuccess(null);
        setError(null);
        try {
          const tx = await emp.withdrawPassedRequest();
          setHash(tx.hash as string);
          await tx.wait();
          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setError(
          new Error(
            "Cannot execute pending withdraw until liveness period has passed."
          )
        );
      }
    };

    const cancelWithdraw = async () => {
      if (hasPendingWithdraw) {
        setHash(null);
        setSuccess(null);
        setError(null);
        try {
          const tx = await emp.cancelWithdrawal();
          setHash(tx.hash as string);
          await tx.wait();
          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setError(new Error("No pending withdraw to cancel."));
      }
    };

    if (hasPendingWithdraw) {
      // If EMP is expired, user can only cancel pending withdrawal requests.
      if (isExpired) {
        return (
          <Box>
            <Box pt={4} pb={2}>
              <Typography>
                <i>You have a pending withdraw on your position!</i>
              </Typography>
            </Box>

            <Box pb={2}>
              <Box py={2}>
                <Typography>
                  You may cancel any pending withdrawal requests that you made
                  prior to the EMP expiration. Post expiry, the only way to
                  remove collateral from this contract is to Settle or Redeem
                  synthetic tokens.
                </Typography>
              </Box>

              <Box py={2}>
                <Typography>
                  <strong>Requested withdrawal amount: </strong>{" "}
                  {`${withdrawAmt} ${collSymbol}`}
                </Typography>
              </Box>
              <Box py={2}>
                <Button variant="contained" onClick={cancelWithdraw}>
                  {`Cancel withdraw request`}
                </Button>
              </Box>
            </Box>
          </Box>
        );
      } else {
        return (
          <Box>
            <Box pt={4} pb={2}>
              <Typography>
                <i>You have a pending withdraw on your position!</i>
              </Typography>
            </Box>

            <Box pb={2}>
              <Box py={2}>
                <Typography>
                  Once the liveness period has passed you can execute your
                  withdrawal request. You can cancel the withdraw request at any
                  time before you execute it.
                </Typography>
              </Box>

              <Box py={2}>
                <Typography>
                  <Box display="flex" alignItems="center">
                    <Box width="100%">
                      <strong>Time left until withdrawal: </strong>
                      {pendingWithdrawTimeString}
                    </Box>
                    <Box width="100%" mr={1}>
                      <LinearProgress
                        variant="determinate"
                        value={progressBarPercent}
                      />{" "}
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                      >{`${progressBarPercent.toFixed(4)}%`}</Typography>
                    </Box>
                  </Box>
                  <br></br>
                  <strong>Requested withdrawal amount: </strong>{" "}
                  {`${withdrawAmt} ${collSymbol}`}
                </Typography>
              </Box>
              <Box py={2}>
                <Tooltip
                  placement="bottom"
                  title={
                    !canExecutePendingWithdraw &&
                    "Once the withdrawal liveness period passes you will be able to click this button"
                  }
                >
                  <span>
                    <Button
                      variant="contained"
                      onClick={executeWithdraw}
                      disabled={!canExecutePendingWithdraw}
                      style={{ marginRight: `12px` }}
                    >
                      {`Withdraw ${withdrawAmt} ${collSymbol} from your position`}
                    </Button>
                  </span>
                </Tooltip>
                <Button variant="contained" onClick={cancelWithdraw}>
                  {`Cancel withdraw request`}
                </Button>
              </Box>
            </Box>
          </Box>
        );
      }
    }

    if (isExpired) {
      return (
        <Box>
          <Box py={2}>
            <Typography>
              <i>
                You cannot withdraw from an expired EMP. You may remove
                collateral by settling or redeeming synthetic tokens.
              </i>
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <Box>
        <Box pt={2} pb={2}>
          <Typography>
            <i>
              By withdrawing collateral from your position you will decrease
              your collateralization ratio.
            </i>
          </Typography>
        </Box>

        <Box pb={2}>
          <Box py={2}>
            <Important>
              IMPORTANT! Please read this carefully or you may lose money.
            </Important>
          </Box>
          <Box pt={2}>
            <Typography>
              There are two kinds of withdrawals you can preform:
            </Typography>
            <ul style={{ fontSize: 16 }}>
              <li>
                <strong>"Fast" withdraw: </strong>Instantly withdraw collateral
                until your collateralization ratio (CR) equals the global
                collateralization ratio (GCR). Currently, you can instantly
                withdraw {fastWithdrawableCollateral} {collSymbol}.
              </li>
              <li>
                <strong>"Slow" withdraw: </strong> To withdraw your CR below the
                GCR, you will need to wait a liveness period before completing
                your withdrawal. For this EMP this is {withdrawLivenessString}{" "}
                hours. When performing this kind of withdrawal you should ensure
                that your position is sufficiently collateralized above the CR
                requirement after the withdrawal or you will risk liquidation.
              </li>
            </ul>
          </Box>
          <Box pt={2} pb={2}>
            <Typography>
              For more info on the different kinds of withdrawals see the{" "}
              <a
                href={DOCS_MAP.MANAGING_POSITION}
                target="_blank"
                rel="noopener noreferrer"
              >
                UMA docs
              </a>
              .
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item md={4} sm={6} xs={12}>
            <TextField
              fullWidth
              type="number"
              variant="outlined"
              inputProps={{ min: "0", max: posColl }}
              label={`Collateral (${collSymbol})`}
              error={withdrawAboveBalance}
              helperText={
                withdrawAboveBalance && `Your locked ${collSymbol} is too low`
              }
              value={collateral}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCollateral(e.target.value)
              }
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <Box>
              <Button
                fullWidth
                variant="contained"
                onClick={withdrawCollateral}
                disabled={
                  resultantCRBelowRequirement ||
                  withdrawAboveBalance ||
                  collateralToWithdraw <= 0
                }
              >
                {`${
                  resultantCRBelowGCR
                    ? "Request Withdrawal of"
                    : "Instantly Withdraw"
                } ${collateralToWithdraw} ${collSymbol}`}
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Box py={4}>
          <Typography>
            {`Resulting liquidation price: `}
            <Tooltip
              placement="right"
              title={
                liquidationPriceDangerouslyFarBelowCurrentPrice &&
                parseFloat(resultantLiquidationPrice) > 0 &&
                `This is >${
                  liquidationPriceWarningThreshold * 100
                }% below the current price: ${prettyLatestPrice}`
              }
            >
              <span
                style={{
                  color:
                    liquidationPriceDangerouslyFarBelowCurrentPrice &&
                    parseFloat(resultantLiquidationPrice) > 0
                      ? "red"
                      : "unset",
                }}
              >
                {resultantLiquidationPrice} ({priceIdentifierUtf8})
              </span>
            </Tooltip>
          </Typography>
          <Typography>
            {`Resulting CR: `}
            <Tooltip
              placement="right"
              title={
                resultantCRBelowRequirement &&
                `This must be above the requirement: ${collReqFromWei}`
              }
            >
              <span
                style={{
                  color: resultantCRBelowRequirement ? "red" : "unset",
                }}
              >
                {pricedResultantCR}
              </span>
            </Tooltip>
          </Typography>
          <Typography>{`GCR: ${pricedGCR}`}</Typography>
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
            <i>Create a position before withdrawing collateral.</i>
          </Typography>
        </Box>
      </Box>
    );
  }
};

export default Withdraw;
