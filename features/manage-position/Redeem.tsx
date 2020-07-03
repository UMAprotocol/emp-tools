import { useState } from "react";
import styled from "styled-components";
import { Box, Button, TextField, Typography } from "@material-ui/core";
import { ethers } from "ethers";

import EmpContract from "../../containers/EmpContract";
import Collateral from "../../containers/Collateral";
import Position from "../../containers/Position";
import Token from "../../containers/Token";

const Container = styled(Box)`
  max-width: 720px;
`;

const Redeem = () => {
  const { contract: emp } = EmpContract.useContainer();
  const { symbol: collSymbol } = Collateral.useContainer();
  const { tokens: borrowedTokens, collateral, pendingWithdraw } = Position.useContainer();
  const { symbol: syntheticSymbol, allowance: syntheticAllowance, setMaxAllowance, balance: syntheticBalance } = Token.useContainer();

  const [tokensToRedeem, setTokensToRedeem] = useState<string>("");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const tokensToRedeemFloat = isNaN(parseFloat(tokensToRedeem)) ? 0 : parseFloat(tokensToRedeem);
  const maxRedeem = Math.min((syntheticBalance || 0), (borrowedTokens || 0));
  const isEmpty = tokensToRedeem === "";
  const canSendTxn = !isNaN(parseFloat(tokensToRedeem)) && tokensToRedeemFloat >= 0 && tokensToRedeemFloat <= (maxRedeem);

  const needAllowance = () => {
    if (syntheticAllowance === null || tokensToRedeem === null) return true;
    if (syntheticAllowance === "Infinity") return false;
    return syntheticAllowance < tokensToRedeemFloat;
  };

  const redeemTokens = async () => {
    if (tokensToRedeem && emp) {
      setHash(null);
      setSuccess(null);
      setError(null);
      const tokensToRedeemWei = ethers.utils.parseUnits(
        tokensToRedeem
      );
      try {
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

  // User does not have a position yet.
  if (borrowedTokens === null || borrowedTokens.toString() === "0" || collateral === null || collateral.toString() === "0") {
    return (
      <Container>
        <Box py={2}>
          <Typography>
            <i>You need to borrow tokens before redeeming.</i>
          </Typography>
        </Box>
      </Container>
    );
  }

  if (pendingWithdraw === null || pendingWithdraw === "Yes") {
    return (
        <Container>
          <Box py={2}>
            <Typography>
              <i>You need to cancel or execute your pending withdrawal request before redeeming tokens.</i>
            </Typography>
          </Box>
        </Container>
    );
  }

  // User has a position and no withdraw requests, so they can redeem tokens.
  return (
    <Container>
      <Box pt={4} pb={2}>
        <Typography>
          By redeeming your synthetic tokens, you will pay back a portion of
          your debt and receive a proportional part of your collateral. Note:
          this will not change the collateralization ratio of your position.
        </Typography>
      </Box>

      <Box py={2}>
        <TextField
          type="number"
          label={`Redeeem (${syntheticSymbol})`}
          placeholder="1234"
          inputProps={{ min: "0" }}
          error={!isEmpty && !canSendTxn}
          helperText={!isEmpty && !canSendTxn ? `Input must be between 0 and ${maxRedeem}` : null}
          value={tokensToRedeem}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTokensToRedeem(e.target.value)
          }
        />
      </Box>

      <Box py={2}>
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

      <Box py={2}>
        <Typography>{`Current borrowed ${syntheticSymbol}: ${borrowedTokens}`}</Typography>
        <Typography>{`Remaining debt after redemption: ${borrowedTokens - tokensToRedeemFloat}`}</Typography>
        <Typography>{`Collateral you will receive on redemption: ${(tokensToRedeemFloat / borrowedTokens) * collateral} ${collSymbol}`}</Typography>
      </Box>

      {hash && (
        <Box py={2}>
          <Typography>
            <strong>Tx Hash: </strong> {hash}
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
    </Container>
  );
};

export default Redeem;
