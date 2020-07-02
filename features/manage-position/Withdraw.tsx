import { useState } from "react";
import styled from "styled-components";
import { Box, Button, TextField, Typography } from "@material-ui/core";
import { ethers } from "ethers";

import EmpState from "../../containers/EmpState";
import EmpContract from "../../containers/EmpContract";
import Collateral from "../../containers/Collateral";
import Position from "../../containers/Position";
import Totals from "../../containers/Totals";

const Container = styled(Box)`
  max-width: 720px;
`;

const Important = styled(Typography)`
  color: red;
  background: black;
  display: inline-block;
`;

const Deposit = () => {
  const { empState } = EmpState.useContainer();
  const { liquidationLiveness } = empState;

  const { contract: emp } = EmpContract.useContainer();
  const { symbol: collSymbol } = Collateral.useContainer();
  const { tokens, collateral } = Position.useContainer();
  const { gcr } = Totals.useContainer();

  const [collateralToWithdraw, setCollateralToWithdraw] = useState<string>("");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const depositCollateral = async () => {
    if (collateralToWithdraw && emp) {
      setHash(null);
      setSuccess(null);
      setError(null);
      const collateralToWithdrawWei = ethers.utils.parseUnits(
        collateralToWithdraw
      );
      try {
        if (resultingCRBelowGCR) {
          const tx = await emp.requestWithdrawal([collateralToWithdrawWei], {
            gasLimit: 7000000,
          });
          setHash(tx.hash as string);
          await tx.wait();
        } else if (!resultingCRBelowGCR) {
          const tx = await emp.withdraw([collateralToWithdrawWei], {
            gasLimit: 7000000,
          });
          setHash(tx.hash as string);
          await tx.wait();
        }

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
    collateral && collateralToWithdraw && tokens
      ? collateral - parseFloat(collateralToWithdraw) / tokens
      : startingCR;

  const resultingCRBelowGCR = resultingCR && gcr ? resultingCR < gcr : null;

  const fastFreeableCollateral =
    collateral && tokens && gcr ? (collateral - gcr * tokens).toFixed(2) : null;

  // User does not have a position yet.
  if (collateral === null || collateral.toString() === "0") {
    return (
      <Container>
        <Box py={2}>
          <Typography>
            <i>Create a position before withdrawing collateral.</i>
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
          <i>
            By withdrawing excess collateral from your position you will
            decrease your collateralization ratio.
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
              <strong>"Fast" withdrawal: </strong>Instantly withdraw collateral
              until your positions collateralization ratio is equal to the
              global collateralization ratio. For your position you can
              instantly withdraw {fastFreeableCollateral} {collSymbol}.
            </li>
            <li>
              <strong>"Slow" withdrawal: </strong> To withdraw past the global
              collateralization ratio, you will need to wait a livness period
              before compleating your withdrawal. For this EMP this is{" "}
              {Math.floor(liquidationLiveness.toNumber() / (60 * 60))} hours.
              When preforming this kind of withdrawal one must ensure that their
              position is sufficiently collateralized after the withdrawal or
              you risk being liquidated.
            </li>
          </ul>
        </Box>
        <Box pt={2}>
          <Typography>
            For more info on the different kinds of withdrawals see the{" "}
            <a
              href="https://docs.umaproject.org/uma/synthetic_tokens/explainer.html#_managing_token_sponsor_positions"
              target="_blank"
              rel="noopener noreferrer"
            >
              UMA docs
            </a>
            .
          </Typography>
        </Box>
      </Box>

      <Box py={2}>
        <TextField
          type="number"
          inputProps={{ min: "0" }}
          label={`Collateral (${collSymbol})`}
          placeholder="1234"
          value={collateralToWithdraw}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCollateralToWithdraw(e.target.value)
          }
        />
      </Box>

      <Box py={2}>
        {collateralToWithdraw && collateralToWithdraw != "0" ? (
          <Button
            variant="contained"
            onClick={handleDepositClick}
          >{`Withdraw ${collateralToWithdraw} ${collSymbol} from your position`}</Button>
        ) : (
          <Button variant="contained" disabled>
            Withdraw
          </Button>
        )}
      </Box>

      <Box py={2}>
        <Typography>Current global CR: {gcr?.toFixed(2) || "N/A"}</Typography>
        <Typography>Current position CR: {startingCR || "N/A"}</Typography>
        <Typography>Resulting position CR: {resultingCR || "N/A"}</Typography>
        {collateralToWithdraw && collateralToWithdraw != "0" ? (
          resultingCRBelowGCR ? (
            <Typography style={{ color: "red" }}>
              Withdrawal places CR below GCR. Will use slow withdrawal. Ensure
              that your final CR is above the EMP CR requirement or you could
              risk liquidation.
            </Typography>
          ) : (
            <Typography style={{ color: "green" }}>
              Withdrawal places CR above GCR. Will use fast withdrawal.
            </Typography>
          )
        ) : (
          ""
        )}
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
