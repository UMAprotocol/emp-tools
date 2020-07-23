import { useState } from "react";
import styled from "styled-components";
import { Box, Button, TextField, Typography } from "@material-ui/core";
import { ethers } from "ethers";

import EmpState from "../../containers/EmpState";
import EmpContract from "../../containers/EmpContract";
import Collateral from "../../containers/Collateral";
import Position from "../../containers/Position";
import Totals from "../../containers/Totals";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";

import { getLiquidationPrice } from "../../utils/getLiquidationPrice";

const Container = styled(Box)`
  max-width: 720px;
`;

const Important = styled(Typography)`
  color: red;
  background: black;
  display: inline-block;
`;

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const hexToUtf8 = ethers.utils.parseBytes32String;
const fromWei = ethers.utils.formatUnits;

const Deposit = () => {
  const { empState } = EmpState.useContainer();
  const { withdrawalLiveness } = empState;

  const { contract: emp } = EmpContract.useContainer();
  const { symbol: collSymbol, decimals: collDec } = Collateral.useContainer();
  const {
    tokens,
    collateral,
    withdrawAmt,
    withdrawPassTime,
    pendingWithdraw,
  } = Position.useContainer();
  const { gcr } = Totals.useContainer();
  const { latestPrice } = PriceFeed.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

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

  // Calculations using raw collateral ratios:
  const collReqFromWei =
    empState.collateralRequirement && collDec
      ? parseFloat(fromWei(empState.collateralRequirement, collDec))
      : null;
  const startingCR =
    collateral !== null && tokens !== null ? collateral / tokens : null;
  const resultingCR =
    collateral !== null && collateralToWithdraw !== null && tokens !== null
      ? (collateral - parseFloat(collateralToWithdraw)) / tokens
      : startingCR;
  const resultingCRBelowGCR =
    resultingCR !== null && gcr !== null ? resultingCR < gcr : null;
  const fastWithdrawableCollateral =
    collateral !== null && tokens !== null && gcr !== null
      ? (collateral - gcr * tokens).toFixed(2)
      : null;

  // Calculations of collateral ratios using same units as price feed:
  const pricedStartingCR =
    startingCR !== null && latestPrice !== null
      ? startingCR / Number(latestPrice)
      : null;
  const pricedResultingCR =
    resultingCR !== null && latestPrice !== null
      ? resultingCR / Number(latestPrice)
      : null;
  const pricedGcr =
    gcr !== null && latestPrice !== null ? gcr / Number(latestPrice) : null;

  // Pending withdrawal request information:
  const pendingWithdrawTimeRemaining =
    collateral !== null &&
    withdrawPassTime !== null &&
    withdrawalLiveness &&
    pendingWithdraw === "Yes" &&
    empState.currentTime
      ? withdrawPassTime - empState.currentTime.toNumber()
      : null;
  const pastWithdrawTimeStamp =
    pendingWithdrawTimeRemaining !== null
      ? pendingWithdrawTimeRemaining <= 0
      : null;
  const pendingWithdrawTimeString =
    pendingWithdrawTimeRemaining !== null
      ? Math.max(0, Math.floor(pendingWithdrawTimeRemaining / 3600)) +
        ":" +
        Math.max(0, Math.floor((pendingWithdrawTimeRemaining % 3600) / 60)) +
        ":" +
        Math.max(0, (pendingWithdrawTimeRemaining % 3600) % 60)
      : null;

  // Data inferred from potential withdrawal amount.
  const withdrawAmountValid =
    collateralToWithdraw !== null &&
    collateral !== null &&
    parseFloat(collateralToWithdraw) <= collateral &&
    parseFloat(collateralToWithdraw) > 0;
  const liquidationPrice =
    collateral !== null && tokens !== null && collReqFromWei !== null
      ? getLiquidationPrice(
          collateral - parseFloat(collateralToWithdraw),
          tokens,
          collReqFromWei
        )
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
              collateralization ratio, you will need to wait a liveness period
              before completing your withdrawal. For this EMP this is{" "}
              {withdrawalLiveness !== null &&
                Math.floor(withdrawalLiveness.toNumber() / (60 * 60))}{" "}
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
        {withdrawAmountValid ? (
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
        <Typography>
          Current position CR: {pricedStartingCR?.toFixed(4) || "N/A"}
        </Typography>
        <Typography>Current GCR: {pricedGcr?.toFixed(4) || "N/A"}</Typography>
        {liquidationPrice !== null && empState?.priceIdentifier && (
          <Typography>
            Liquidation Price:
            {` ${liquidationPrice.toFixed(4)} ${hexToUtf8(
              empState.priceIdentifier
            )}`}
          </Typography>
        )}
        {withdrawAmountValid && resultingCRBelowGCR && (
          <span>
            <Typography>
              Resulting position CR: {pricedResultingCR?.toFixed(4) || "N/A"}
            </Typography>
            <Typography style={{ color: "red" }}>
              Withdrawal places CR below GCR. Will use slow withdrawal. Ensure
              that your final CR is above the EMP CR requirement or you could
              risk liquidation.
            </Typography>
          </span>
        )}
        {withdrawAmountValid && !resultingCRBelowGCR && (
          <Typography style={{ color: "green" }}>
            Withdrawal maintains CR above GCR. Will use fast withdrawal.
          </Typography>
        )}
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
    </Container>
  );
};

export default Deposit;
