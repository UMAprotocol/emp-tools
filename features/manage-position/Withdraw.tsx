import { useState } from "react";
import styled from "styled-components";
import { Box, Button, TextField, Typography, Grid } from "@material-ui/core";
import { ethers } from "ethers";

import EmpState from "../../containers/EmpState";
import EmpContract from "../../containers/EmpContract";
import Collateral from "../../containers/Collateral";
import Position from "../../containers/Position";
import Totals from "../../containers/Totals";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";

import { getLiquidationPrice } from "../../utils/getLiquidationPrice";
import { DOCS_MAP } from "../../utils/getDocLinks";

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
    cRatio,
    withdrawAmt,
    withdrawPassTime,
    pendingWithdraw,
  } = Position.useContainer();
  const { gcr } = Totals.useContainer();
  const { latestPrice } = PriceFeed.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  const [collateralToWithdraw, setCollateralToWithdraw] = useState<string>("0");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const withdrawCollateral = async () => {
    if (collateralToWithdraw && emp) {
      setHash(null);
      setSuccess(null);
      setError(null);
      try {
        const collateralToWithdrawWei = ethers.utils.parseUnits(
          collateralToWithdraw
        );
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
  const startingCR = cRatio;
  const resultingCR =
    collateral !== null && collateralToWithdraw && tokens !== null && tokens > 0
      ? (collateral - parseFloat(collateralToWithdraw)) / tokens
      : startingCR;
  const resultingCRBelowGCR =
    resultingCR !== null && gcr !== null ? resultingCR < gcr : null;
  const fastWithdrawableCollateral = () => {
    if (collateral !== null && tokens !== null && gcr !== null) {
      const withdrawableCollat = collateral - gcr * tokens;
      // Only if there is more than 0 fast withdrawable collateral should we return a value.
      // Else, there is nothing that can be fast withdrawn.
      if (withdrawableCollat > 0) return withdrawableCollat.toFixed(2);
      else return "0";
    }
    return null;
  };

  // Calculations of collateral ratios using same units as price feed:
  const pricedStartingCR =
    startingCR !== null && latestPrice !== null && latestPrice > 0
      ? startingCR / Number(latestPrice)
      : null;
  const pricedResultingCR =
    resultingCR !== null && latestPrice !== null && latestPrice > 0
      ? resultingCR / Number(latestPrice)
      : null;
  const pricedGcr =
    gcr !== null && latestPrice !== null ? gcr / Number(latestPrice) : null;
  const resultingPricedCRBelowCRRequirement =
    pricedResultingCR !== null && collReqFromWei !== null
      ? pricedResultingCR < collReqFromWei
      : true;

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
  const withdrawUnderbalance =
    collateralToWithdraw &&
    collateral &&
    parseFloat(collateralToWithdraw) <= collateral;
  const withdrawAmountValid =
    collateralToWithdraw !== null &&
    collateral !== null &&
    withdrawUnderbalance &&
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
      <Box>
        <Box py={2}>
          <Typography>
            <i>Create a position before withdrawing collateral.</i>
          </Typography>
        </Box>
      </Box>
    );
  }

  // User has a position and a pending withdrawal.
  if (collateral !== null && pendingWithdraw === "Yes") {
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
      </Box>
    );
  }
  // User has a position and no pending withdrawal.
  return (
    <Box>
      <Box pt={2} pb={2}>
        <Typography>
          <i>
            By withdrawing collateral from your position you will decrease your
            collateralization ratio.
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
              collateralization ratio (GCR). For your position you can withdraw{" "}
              {fastWithdrawableCollateral()} {collSymbol}.
            </li>
            <li>
              <strong>"Slow" withdraw: </strong> To withdraw below the GCR, you
              will need to wait a liveness period before completing your
              withdrawal. For this EMP this is{" "}
              {withdrawalLiveness &&
                Math.floor(withdrawalLiveness.toNumber() / (60 * 60))}{" "}
              hours. When preforming this kind of withdrawal you should ensure
              that your position is sufficiently collateralized above the CR
              requirement after the withdrawal or you risk being liquidated.
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
        <Grid item xs={4}>
          <TextField
            fullWidth
            type="number"
            variant="outlined"
            inputProps={{ min: "0" }}
            label={`Collateral (${collSymbol})`}
            placeholder="1234"
            value={collateralToWithdraw}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCollateralToWithdraw(e.target.value)
            }
          />
        </Grid>
        <Grid item xs={4}>
          <Box py={1}>
            {collateralToWithdraw && collateralToWithdraw != "0" ? (
              <Button variant="contained" onClick={handleWithdrawClick}>{`${
                resultingCRBelowGCR ? "Request Withdrawal of" : "Withdraw"
              } ${collateralToWithdraw} ${collSymbol}`}</Button>
            ) : (
              <Button variant="contained" disabled>
                Withdraw
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box py={4}>
        <Typography>
          Current CR: {pricedStartingCR?.toFixed(4) || "N/A"}
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
        <Typography>
          CR Requirement: {collReqFromWei?.toFixed(4) || "N/A"}
        </Typography>
        {pricedResultingCR !== null && (
          <Typography>
            Resulting position CR: {pricedResultingCR.toFixed(4) || "N/A"}
          </Typography>
        )}
        {withdrawAmountValid && resultingPricedCRBelowCRRequirement && (
          <Typography style={{ color: "red" }}>
            Withdrawal would drop your CR below the CR requirement and your
            position will be at risk of getting liquidated.
          </Typography>
        )}
        {withdrawAmountValid &&
          !resultingPricedCRBelowCRRequirement &&
          resultingCRBelowGCR && (
            <Typography style={{ color: "red" }}>
              Withdrawal places CR below GCR. Will use slow withdrawal. Ensure
              that your final CR is above the EMP CR requirement or you could
              risk liquidation.
            </Typography>
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
    </Box>
  );
};

export default Deposit;
