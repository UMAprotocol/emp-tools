import { useState } from "react";
import styled from "styled-components";
import { Box, Button, TextField, Typography, Grid } from "@material-ui/core";
import { ethers } from "ethers";

import EmpContract from "../../containers/EmpContract";
import EmpState from "../../containers/EmpState";
import Collateral from "../../containers/Collateral";
import Position from "../../containers/Position";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";

import { getLiquidationPrice } from "../../utils/getLiquidationPrice";

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const fromWei = ethers.utils.formatUnits;
const hexToUtf8 = ethers.utils.parseBytes32String;

const Deposit = () => {
  const { contract: emp } = EmpContract.useContainer();
  const { empState } = EmpState.useContainer();
  const {
    symbol: collSymbol,
    balance,
    decimals: collDec,
    allowance,
    setMaxAllowance,
  } = Collateral.useContainer();
  const {
    tokens,
    collateral,
    cRatio,
    pendingWithdraw,
  } = Position.useContainer();
  const { latestPrice } = PriceFeed.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  const [collateralToDeposit, setCollateralToDeposit] = useState<string>("0");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const balanceTooLow = (balance || 0) < (Number(collateralToDeposit) || 0);

  const needAllowance = () => {
    if (allowance === null || collateral === null) return true;
    if (allowance === "Infinity") return false;
    return allowance < parseFloat(collateralToDeposit);
  };

  const depositCollateral = async () => {
    if (collateralToDeposit && emp) {
      setHash(null);
      setSuccess(null);
      setError(null);
      try {
        const collateralToDepositWei = ethers.utils.parseUnits(
          collateralToDeposit
        );
        const tx = await emp.deposit([collateralToDepositWei]);
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

  const startingCR = cRatio;
  const pricedStartingCR =
    startingCR !== null && latestPrice !== null && latestPrice > 0
      ? startingCR / Number(latestPrice)
      : null;

  const resultingCR =
    collateral !== null &&
    collateralToDeposit !== "0" &&
    tokens !== null &&
    tokens > 0
      ? (collateral + parseFloat(collateralToDeposit)) / tokens
      : startingCR;
  const pricedResultingCR =
    resultingCR && latestPrice !== null && latestPrice > 0
      ? resultingCR / Number(latestPrice)
      : null;

  const collReqFromWei =
    empState?.collateralRequirement && collDec !== null
      ? parseFloat(fromWei(empState.collateralRequirement, collDec))
      : null;
  const liquidationPrice =
    collateral !== null
      ? getLiquidationPrice(
          collateral + parseFloat(collateralToDeposit),
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
            <i>Create a position before depositing more collateral.</i>
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
              before depositing additional collateral.
            </i>
          </Typography>
        </Box>
      </Box>
    );
  }

  // User has a position and no pending withdrawal requests so can deposit more collateral.
  return (
    <Box>
      <Box pt={2} pb={4}>
        <Typography>
          Adding additional collateral into your position will increase your
          collateralization ratio.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Box py={0}>
            <TextField
              fullWidth
              type="number"
              variant="outlined"
              inputProps={{ min: "0" }}
              label={`Collateral (${collSymbol})`}
              placeholder="1234"
              error={balanceTooLow}
              helperText={
                balanceTooLow ? `${collSymbol} balance too low` : null
              }
              value={collateralToDeposit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCollateralToDeposit(e.target.value)
              }
            />
          </Box>
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
            {!needAllowance() &&
            !isNaN(parseFloat(collateralToDeposit)) &&
            parseFloat(collateralToDeposit) > 0 &&
            !balanceTooLow ? (
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
        </Grid>
      </Grid>

      <Box py={4}>
        <Typography>
          Current CR: {pricedStartingCR?.toFixed(4) || "N/A"}
        </Typography>
        <Typography>
          Resulting CR: {pricedResultingCR?.toFixed(4) || "N/A"}
        </Typography>
        <Typography>
          Resulting Liquidation Price:{" "}
          {liquidationPrice !== null && empState?.priceIdentifier
            ? `${liquidationPrice?.toFixed(4)} ${hexToUtf8(
                empState.priceIdentifier
              )}`
            : "N/A"}
        </Typography>
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
