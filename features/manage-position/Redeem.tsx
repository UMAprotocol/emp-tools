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
  const { tokens: borrowedTokens, collateral } = Position.useContainer();
  const { symbol: syntheticSymbol, allowance: syntheticAllowance, setMaxAllowance } = Token.useContainer();

  const [tokensToRedeem, setTokensToRedeem] = useState<string>("");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);


  const needAllowance = () => {
    if (syntheticAllowance === null || tokensToRedeem === null) return true;
    if (syntheticAllowance === "Infinity") return false;
    return syntheticAllowance < parseFloat(tokensToRedeem);
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
        const tx = await emp.deposit([tokensToRedeemWei], {
          gasLimit: 7000000,
        });
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

  // User has a position so can deposit more collateral.
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
          inputProps={{ min: "0", max: borrowedTokens.toString() }}
          label={`Redeeem (${syntheticSymbol})`}
          placeholder="1234"
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
        {tokensToRedeem && tokensToRedeem != "0" && !needAllowance() ? (
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
        <Typography>{`Remaining debt after redemption: ${borrowedTokens - parseFloat(tokensToRedeem)}`}</Typography>
        <Typography>{`Collateral you will receive on redemption: ${(parseFloat(tokensToRedeem) / borrowedTokens) * collateral} ${collSymbol}`}</Typography>
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