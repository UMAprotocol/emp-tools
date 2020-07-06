import { useEffect, useState } from "react";
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
  const {
    tokens,
    collateral,
    withdrawAmt,
    withdrawPassTime,
    pendingWithdraw,
  } = Position.useContainer();
  const { gcr } = Totals.useContainer();

  const [collateralToWithdraw, setCollateralToWithdraw] = useState<string>("");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const withdrawCollateral = async () => {
    if (collateralToWithdraw && emp) {
      setHash(null);
      setSuccess(null);
      setError(null);
      const collateralToWithdrawWei = ethers.utils.parseUnits(
        collateralToWithdraw
      );
      try {
        if (resultingCRBelowGCR) {
          const tx = await emp.requestWithdrawal([collateralToWithdrawWei]);
          setHash(tx.hash as string);
          await tx.wait();
        } else if (!resultingCRBelowGCR) {
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
      setError(new Error("Please check that you are connected."));
    }
  };
  const executeWithdraw = async () => {
    if (pendingWithdrawTimeRemaining && emp) {
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
      setError(new Error("Please check that you are connected."));
    }
  };

  const cancelWithdraw = async () => {
    if (pendingWithdrawTimeRemaining && emp) {
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
      setError(new Error("Please check that you are connected."));
    }
  };

  const handleWithdrawClick = () => withdrawCollateral();
  const handleExecuteWithdrawClick = () => executeWithdraw();
  const handleCancelWithdrawClick = () => cancelWithdraw();

  const startingCR = collateral && tokens ? collateral / tokens : null;

  const resultingCR =
    collateral && collateralToWithdraw && tokens
      ? (collateral - parseFloat(collateralToWithdraw)) / tokens
      : startingCR;

  const resultingCRBelowGCR = resultingCR && gcr ? resultingCR < gcr : null;

  const fastWithdrawableCollateral =
    collateral && tokens && gcr ? (collateral - gcr * tokens).toFixed(2) : null;

  const pendingWithdrawTimeRemaining =
    collateral && withdrawPassTime && pendingWithdraw === "Yes"
      ? withdrawPassTime - Math.floor(Date.now() / 1000) - 7200
      : null;

  const pastWithdrawTimeStamp = pendingWithdrawTimeRemaining
    ? pendingWithdrawTimeRemaining <= 0
    : null;

  const pendingWithdrawTimeString = pendingWithdrawTimeRemaining
    ? Math.max(0, Math.floor(pendingWithdrawTimeRemaining / 3600)) +
      ":" +
      Math.max(0, Math.floor((pendingWithdrawTimeRemaining % 3600) / 60)) +
      ":" +
      Math.max(0, ((pendingWithdrawTimeRemaining % 3600) % 60))
    : null;
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

  // User has a position and a pending withdrawal.
  if (collateral !== null && pendingWithdraw === "Yes") {
    return (
      <Container>
        <Box pt={4} pb={2}>
          <Typography>
            <i>You have a pending withdraw on your position!</i>
          </Typography>
        </Box>

        <Box pb={2}>
          <Box py={2}>
            <Typography>
              Once the liveness period has passed you can execute your
              withdrawal request. You can also cancel the withdraw request if
              you changed your mind.
            </Typography>
          </Box>
          <Box py={2}>
            <Typography>
              <strong>Time left until withdrawal: </strong>
              {pendingWithdrawTimeString}
              <br></br>
              <strong>Requested withdrawal amount: </strong> {withdrawAmt}{" "}
              {collSymbol}
            </Typography>
          </Box>

          <Box py={2}>
            {pastWithdrawTimeStamp ? (
              <Button
                variant="contained"
                onClick={handleExecuteWithdrawClick}
                style={{ marginRight: `12px` }}
              >{`Withdraw ${collateralToWithdraw} ${collSymbol} from your position`}</Button>
            ) : (
              <Button
                variant="contained"
                style={{ marginRight: `12px` }}
                disabled
              >
                Execute Withdrawal Request
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleCancelWithdrawClick}
            >{`Cancel withdraw request`}</Button>
          </Box>
        </Box>
      </Container>
    );
  }
  // User has a position and no pending withdrawal.
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
              instantly withdraw {fastWithdrawableCollateral} {collSymbol}.
            </li>
            <li>
              <strong>"Slow" withdrawal: </strong> To withdraw past the global
              collateralization ratio, you will need to wait a livness period
              before compleating your withdrawal. For this EMP this is{" "}
              {liquidationLiveness &&
                Math.floor(liquidationLiveness.toNumber() / (60 * 60))}{" "}
              hours. When preforming this kind of withdrawal one must ensure
              that their position is sufficiently collateralized after the
              withdrawal or you risk being liquidated.
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
          <Button variant="contained" onClick={handleWithdrawClick}>{`${
            resultingCRBelowGCR ? "Request Withdrawal of" : "Withdraw"
          } ${collateralToWithdraw} ${collSymbol} from your position`}</Button>
        ) : (
          <Button variant="contained" disabled>
            Withdraw
          </Button>
        )}
      </Box>

      <Box py={2}>
        <Typography>Current global CR: {gcr || "N/A"}</Typography>
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
