import { ethers } from "ethers";
import styled from "styled-components";
import { Box, Button, TextField, Typography } from "@material-ui/core";

import EmpContract from "../../containers/EmpContract";
import { useState } from "react";
import Position from "../../containers/Position";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";

const Container = styled(Box)`
  max-width: 720px;
`;

const fromWei = ethers.utils.formatUnits;

const Deposit = () => {
  const { contract: emp } = EmpContract.useContainer();
  const { symbol: collSymbol, decimals: collDec } = Collateral.useContainer();
  const { symbol: tokenSymbol, decimals: tokenDec } = Token.useContainer();
  const { tokens, collateral } = Position.useContainer();

  const [depositedCollateral, setDepositedCollateral] = useState<string>("");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const depositCollateral = async () => {
    if (depositedCollateral && emp) {
      setHash(null);
      setSuccess(null);
      setError(null);
      const depositedCollateralWei = ethers.utils.parseUnits(
        depositedCollateral
      );
      try {
        const tx = await emp.deposit([depositedCollateralWei], {
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

  const handleDepositClick = () => depositCollateral();

  const startingCR =
    collateral && tokens && collDec && tokenDec
      ? parseFloat(fromWei(collateral, collDec)) /
        parseFloat(fromWei(tokens, tokenDec))
      : null;

  const resultingCR =
    collateral && depositedCollateral && tokens && collDec && tokenDec
      ? (parseFloat(fromWei(collateral, collDec)) +
          parseFloat(depositedCollateral)) /
        parseFloat(fromWei(tokens, tokenDec))
      : startingCR;

  // User does not have a position yet.
  if (collateral === null || collateral.toString() === "0") {
    return (
      <Container>
        <Box py={2}>
          <Typography>
            <i>Create a position before depositing more collateral.</i>
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
          By depositing additional collateral into your position you will
          increase your collateralization ratio.
        </Typography>
      </Box>

      <Box py={2}>
        <TextField
          type="number"
          inputProps={{ min: "0" }}
          label={`Add collateral (${collSymbol})`}
          placeholder="1234"
          value={depositedCollateral}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setDepositedCollateral(e.target.value)
          }
        />
      </Box>
      {depositedCollateral}
      <Box py={2}>
        {depositedCollateral && depositedCollateral != "0" ? (
          <Button
            variant="contained"
            onClick={handleDepositClick}
          >{`Deposit ${depositedCollateral} ${collSymbol} into your position`}</Button>
        ) : (
          <Button variant="contained" disabled>
            Deposit
          </Button>
        )}
      </Box>

      <Box py={2}>
        <Typography>Current CR: {startingCR || "N/A"}</Typography>
        <Typography>Resulting CR: {resultingCR || "N/A"}</Typography>
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

export default Deposit;
