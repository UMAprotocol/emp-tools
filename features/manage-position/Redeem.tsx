import { useState } from "react";
import styled from "styled-components";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Grid,
  Tooltip,
} from "@material-ui/core";
import { utils } from "ethers";

import EmpContract from "../../containers/EmpContract";
import EmpState from "../../containers/EmpState";
import Collateral from "../../containers/Collateral";
import Position from "../../containers/Position";
import Token from "../../containers/Token";
import Etherscan from "../../containers/Etherscan";

import { toWeiSafe } from "../../utils/convertToWeiSafely";

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const MaxLink = styled.div`
  text-decoration-line: underline;
`;

const { formatUnits: fromWei } = utils;

const Redeem = () => {
  const { contract: emp } = EmpContract.useContainer();
  const { empState } = EmpState.useContainer();
  const { minSponsorTokens } = empState;
  const { symbol: collSymbol } = Collateral.useContainer();
  const {
    tokens: posTokensString,
    collateral: posCollString,
    pendingWithdraw,
  } = Position.useContainer();
  const {
    symbol: tokenSymbol,
    allowance: tokenAllowance,
    decimals: tokenDec,
    setMaxAllowance,
    balance: tokenBalance,
    balanceBN: tokenBalanceBN,
  } = Token.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  const [tokens, setTokens] = useState<string>("0");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  if (
    posTokensString !== null &&
    posCollString !== null &&
    minSponsorTokens !== null &&
    tokenBalance !== null &&
    tokenBalanceBN !== null &&
    tokenDec !== null &&
    tokenSymbol !== null &&
    tokenAllowance !== null &&
    emp !== null &&
    pendingWithdraw !== null &&
    Number(posCollString) > 0 // If position has no collateral, then don't render redeem component.
  ) {
    const hasPendingWithdraw = pendingWithdraw === "Yes";
    const posTokens = Number(posTokensString);
    const posColl = Number(posCollString);
    const tokensToRedeem =
      (Number(tokens) || 0) > posTokens ? posTokens : Number(tokens) || 0;
    const minSponsorTokensFromWei = parseFloat(
      fromWei(minSponsorTokens, tokenDec)
    );

    // If not redeeming full position, then cannot bring position below the minimum sponsor token threshold.
    // Amount of collateral received is proportional to percentage of outstanding tokens in position retired.
    const maxPartialRedeem =
      posTokens > minSponsorTokensFromWei
        ? posTokens - minSponsorTokensFromWei
        : 0;
    const proportionTokensRedeemed =
      posTokens > 0 ? tokensToRedeem / posTokens : 0;
    const proportionCollateralReceived =
      proportionTokensRedeemed <= 1
        ? proportionTokensRedeemed * posColl
        : posColl;
    const resultantTokens =
      posTokens >= tokensToRedeem ? posTokens - tokensToRedeem : 0;
    const resultantCollateral = posColl - proportionCollateralReceived;

    // Error conditions for calling redeem: (Some of these might be redundant)
    const balanceBelowTokensToRedeem = tokenBalance < tokensToRedeem;
    const invalidRedeemAmount =
      tokensToRedeem < posTokens && tokensToRedeem > maxPartialRedeem;
    const needAllowance =
      tokenAllowance !== "Infinity" && tokenAllowance < tokensToRedeem;

    const redeemTokens = async () => {
      if (tokensToRedeem > 0) {
        setHash(null);
        setSuccess(null);
        setError(null);
        try {
          const tokensToRedeemWei = toWeiSafe(tokens, tokenDec);
          const tx = await emp.redeem([tokensToRedeemWei]);
          setHash(tx.hash as string);
          await tx.wait();
          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setError(new Error("Token amounts must be positive"));
      }
    };

    const setTokensToRedeemToMax = () => {
      // `tokenBalance` and `posTokens` might be incorrectly rounded,
      // so we compare their raw BN's instead.
      if (tokenBalanceBN.gte(toWeiSafe(posTokensString, tokenDec))) {
        setTokens(posTokensString);
      } else {
        setTokens(tokenBalance.toString());
      }
    };

    if (hasPendingWithdraw) {
      return (
        <Box>
          <Box py={2}>
            <Typography>
              <i>
                You need to cancel or execute your pending withdrawal request
                before redeeming tokens.
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
            By redeeming your synthetic tokens, you will pay back a portion of
            your debt and receive a proportional part of your collateral.
            <br></br>
            <br></br>
            <strong>Note:</strong> this will not change the collateralization
            ratio of your position or its liquidation price.
          </Typography>
          <br></br>
          <Typography>
            {`When redeeming, you must keep at least ${minSponsorTokensFromWei} ${tokenSymbol} in your position. Currently, you can either redeem exactly ${posTokens} or no more than ${maxPartialRedeem} ${tokenSymbol}`}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item md={4} sm={6} xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              type="number"
              label={`Redeem (${tokenSymbol})`}
              inputProps={{ min: "0", max: tokenBalance }}
              error={balanceBelowTokensToRedeem || invalidRedeemAmount}
              helperText={
                invalidRedeemAmount &&
                `If you are not redeeming all tokens outstanding, then you must keep more than ${minSponsorTokensFromWei} ${tokenSymbol} in your position`
              }
              value={tokens}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTokens(e.target.value)
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button fullWidth onClick={() => setTokensToRedeemToMax()}>
                      <MaxLink>Max</MaxLink>
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <Box>
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
                  disabled={
                    balanceBelowTokensToRedeem ||
                    invalidRedeemAmount ||
                    tokensToRedeem <= 0
                  }
                  onClick={redeemTokens}
                >
                  {`Redeem ${tokensToRedeem} ${tokenSymbol}`}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        <Box py={4}>
          <Typography>{`${collSymbol} you will receive: ${proportionCollateralReceived}`}</Typography>
          <Typography>
            <Tooltip
              placement="right"
              title={
                invalidRedeemAmount &&
                `This must remain above ${minSponsorTokensFromWei}`
              }
            >
              <span
                style={{
                  color: invalidRedeemAmount ? "red" : "unset",
                }}
              >
                {`Remaining ${tokenSymbol} in your position after redemption: ${resultantTokens}`}
              </span>
            </Tooltip>
          </Typography>
          <Typography>{`Remaining ${collSymbol} in your position after redemption: ${resultantCollateral}`}</Typography>
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
            <i>You need to borrow tokens before redeeming.</i>
          </Typography>
        </Box>
      </Box>
    );
  }
};

export default Redeem;
