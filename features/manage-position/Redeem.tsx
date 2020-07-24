import { useState } from "react";
import styled from "styled-components";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Grid,
} from "@material-ui/core";
import { ethers, BigNumberish } from "ethers";

import EmpContract from "../../containers/EmpContract";
import EmpState from "../../containers/EmpState";
import Collateral from "../../containers/Collateral";
import Position from "../../containers/Position";
import Token from "../../containers/Token";
import Etherscan from "../../containers/Etherscan";

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const MaxLink = styled.div`
  text-decoration-line: underline;
`;

const fromWei = ethers.utils.formatUnits;
const weiToNum = (x: BigNumberish, u = 18) => parseFloat(fromWei(x, u));

const Redeem = () => {
  const { contract: emp } = EmpContract.useContainer();
  const { empState } = EmpState.useContainer();
  const { symbol: collSymbol } = Collateral.useContainer();
  const {
    tokens: borrowedTokens,
    collateral,
    pendingWithdraw,
  } = Position.useContainer();
  const {
    symbol: syntheticSymbol,
    allowance: syntheticAllowance,
    setMaxAllowance,
    balance: syntheticBalance,
  } = Token.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  const [tokensToRedeem, setTokensToRedeem] = useState<string>("0");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const tokensToRedeemFloat = isNaN(parseFloat(tokensToRedeem))
    ? 0
    : parseFloat(tokensToRedeem);
  const tokensAboveMin =
    borrowedTokens && empState.minSponsorTokens
      ? borrowedTokens - weiToNum(empState.minSponsorTokens)
      : 0;
  const unwindPosition =
    borrowedTokens &&
    tokensToRedeemFloat &&
    syntheticBalance &&
    borrowedTokens === tokensToRedeemFloat &&
    borrowedTokens <= syntheticBalance;
  const maxRedeem = Math.min(
    syntheticBalance || 0,
    borrowedTokens || 0,
    tokensAboveMin || 0
  );
  const isEmpty = tokensToRedeem === "";
  const canSendTxn =
    !isNaN(parseFloat(tokensToRedeem)) &&
    tokensToRedeemFloat > 0 &&
    (tokensToRedeemFloat <= maxRedeem || unwindPosition);

  const needAllowance = () => {
    if (syntheticAllowance === null || tokensToRedeem === null) return true;
    if (syntheticAllowance === "Infinity") return false;
    return syntheticAllowance < tokensToRedeemFloat;
  };

  const collateralToReceive =
    borrowedTokens !== null && borrowedTokens > 0 && collateral !== null
      ? (tokensToRedeemFloat / borrowedTokens) * collateral
      : null;

  const redeemTokens = async () => {
    if (tokensToRedeem && emp) {
      setHash(null);
      setSuccess(null);
      setError(null);
      try {
        const tokensToRedeemWei = ethers.utils.parseUnits(tokensToRedeem);
        const tx = await emp.redeem([tokensToRedeemWei]);
        setHash(tx.hash as string);
        await tx.wait();
        setSuccess(true);
      } catch (error) {
        console.error(error);
        setError(error);
      }
    } else {
      setError(new Error("Please check that you are connected."));
    }
  };

  const handleRedemptionClick = () => redeemTokens();

  const handleMax = () => {
    setTokensToRedeem(borrowedTokens ? borrowedTokens.toString() : "");
  };

  // User does not have a position yet.
  if (
    borrowedTokens === null ||
    borrowedTokens.toString() === "0" ||
    collateral === null ||
    collateral.toString() === "0"
  ) {
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

  if (pendingWithdraw === null || pendingWithdraw === "Yes") {
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

  // User has a position and no withdraw requests, so they can redeem tokens.
  return (
    <Box>
      <Box pt={2} pb={4}>
        <Typography>
          By redeeming your synthetic tokens, you will pay back a portion of
          your debt and receive a proportional part of your collateral.
          <br></br>
          <br></br>
          <strong>Note:</strong> this will not change the collateralization
          ratio of your position.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={4}>
          <TextField
            fullWidth
            variant="outlined"
            type="number"
            label={`Redeeem (${syntheticSymbol})`}
            placeholder="1234"
            inputProps={{ min: "0" }}
            error={!isEmpty && !canSendTxn}
            helperText={
              !isEmpty && !canSendTxn
                ? `Input must be between 0 and ${maxRedeem} or the entire position`
                : null
            }
            value={tokensToRedeem}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTokensToRedeem(e.target.value)
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button onClick={() => handleMax()}>
                    <MaxLink>Max</MaxLink>
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <Box py={1}>
            {needAllowance() && (
              <Button
                variant="contained"
                onClick={setMaxAllowance}
                style={{ marginRight: `12px` }}
              >
                Approve
              </Button>
            )}
            {canSendTxn && !needAllowance() ? (
              <Button
                variant="contained"
                onClick={handleRedemptionClick}
              >{`Redeem ${tokensToRedeem} ${syntheticSymbol}`}</Button>
            ) : (
              <Button variant="contained" disabled>
                Redeem
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box py={4}>
        <Typography>{`Current borrowed ${syntheticSymbol}: ${borrowedTokens}`}</Typography>
        <Typography>{`Remaining debt after redemption: ${
          borrowedTokens - tokensToRedeemFloat
        }`}</Typography>
        <Typography>{`Collateral you will receive on redemption: ${collateralToReceive} ${collSymbol}`}</Typography>
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
};

export default Redeem;
