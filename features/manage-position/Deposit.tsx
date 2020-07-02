import { useState } from "react";
import styled from "styled-components";
import { Box, Button, TextField, Typography } from "@material-ui/core";
import { ethers } from "ethers";

import EmpContract from "../../containers/EmpContract";
import Collateral from "../../containers/Collateral";
import Position from "../../containers/Position";

const Container = styled(Box)`
  max-width: 720px;
`;

const Deposit = () => {
  const { contract: emp } = EmpContract.useContainer();
  const { symbol: collSymbol } = Collateral.useContainer();
  const { tokens, collateral } = Position.useContainer();

  const [collateralToDeposit, setCollateralToDeposit] = useState<string>("");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const depositCollateral = async () => {
    if (collateralToDeposit && emp) {
      setHash(null);
      setSuccess(null);
      setError(null);
      const collateralToDepositWei = ethers.utils.parseUnits(
        collateralToDeposit
      );
      try {
        const tx = await emp.deposit([collateralToDepositWei], {
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

  const startingCR = collateral && tokens ? collateral / tokens : null;

  const resultingCR =
    collateral && collateralToDeposit && tokens
      ? collateral + parseFloat(collateralToDeposit) / tokens
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
          label={`Collateral (${collSymbol})`}
          placeholder="1234"
          value={collateralToDeposit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCollateralToDeposit(e.target.value)
          }
        />
      </Box>

      <Box py={2}>
        {collateralToDeposit && collateralToDeposit != "0" ? (
          <Button
            variant="contained"
            onClick={handleDepositClick}
          >{`Deposit ${collateralToDeposit} ${collSymbol} into your position`}</Button>
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
