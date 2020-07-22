import { Box, TextField, Typography } from "@material-ui/core";
import { useState, useEffect } from "react";
import styled from "styled-components";
import EmpState from "../../containers/EmpState";

const Container = styled.div`
  padding: 1rem;
  border: 1px solid #434343;
`;

const FormInput = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const MS_PER_S = 1000;
const S_PER_DAY = 60 * 60 * 24;
const DAYS_PER_YEAR = 365;

// TODO: When the yUSD market goes live on an exchange, we can replace this
// `PLACEHOLDER_PRICE` with the real-time mid-market price for yUSD.
const PLACEHOLDER_PRICE = "0.9875";

// TODO: If the user has not selected an EMP (or has not even connected their web3 provider yet),
// then the EMP's expirationTimestamp will clearly be unavailable. In order to support explorability,
// this is a placeholder `daysToExpiry` that will be the default value for the textfield if no EMP is selected yet.
const PLACEHOLDER_DAYS_TO_EXPIRY = "30";

const YieldCalculator = () => {
  const { empState } = EmpState.useContainer();
  const [tokenPrice, setTokenPrice] = useState<string | null>(
    PLACEHOLDER_PRICE
  );
  const [yieldAmount, setYieldAmount] = useState<number | null>(null);
  const expirationTimestamp = empState.expirationTimestamp;

  const calculateDaysToExpiry = () => {
    if (expirationTimestamp) {
      const currentTimestamp = Math.round(Date.now() / MS_PER_S);
      const secondsToExpiry = expirationTimestamp.toNumber() - currentTimestamp;

      return Math.round(secondsToExpiry / S_PER_DAY);
    } else {
      return null;
    }
  };

  // @dev: We set this state var `daysToExpiry` after declaring `calculateDaysToExpiry()` because we first want to check if its value is
  // non null in order to set its default value.
  const [daysToExpiry, setDaysToExpiry] = useState<string | null>(
    calculateDaysToExpiry()?.toString() || PLACEHOLDER_DAYS_TO_EXPIRY
  );

  const calculateYield = () => {
    if (!tokenPrice || Number(tokenPrice) <= 0) {
      return null;
    }
    if (!daysToExpiry || Number(daysToExpiry) <= 0) {
      return null;
    }

    // `yieldPerUnit` = (FACE/yUSD_PX)^(1/(365/DAYS_TO_EXP)) - 1,
    // where FACE = $1. More details: https://www.bankrate.com/glossary/a/apy-annual-percentage-yield/
    const yieldPerUnit =
      Math.pow(
        1 / Number(tokenPrice),
        1 / (Number(daysToExpiry) / DAYS_PER_YEAR)
      ) - 1;
    return yieldPerUnit;
  };

  const prettyPercentage = (x: number | null) => {
    if (x === null) return "N/A";
    return (x * 100).toFixed(4);
  };

  // Update the yield whenever the parameters change.
  useEffect(() => {
    setYieldAmount(calculateYield());
  }, [tokenPrice, daysToExpiry]);

  return (
    <Box pt={4}>
      <Container>
        <form noValidate autoComplete="off">
          <Typography variant="h5">yUSD Yield Calculator</Typography>
          <FormInput></FormInput>
          <FormInput>
            <TextField
              type="string"
              label="Current yUSD Price"
              value={tokenPrice?.toString() || ""}
              onChange={(e) => setTokenPrice(e.target.value)}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormInput>
          <FormInput>
            <TextField
              type="string"
              label="Days to Expiry"
              value={daysToExpiry?.toString() || ""}
              onChange={(e) => setDaysToExpiry(e.target.value)}
              helperText={`Days to expiry for selected EMP: ${calculateDaysToExpiry()}`}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormInput>
          <FormInput>
            <TextField
              disabled
              type="string"
              label="APY (%)"
              value={
                yieldAmount !== null ? `${prettyPercentage(yieldAmount)}` : ""
              }
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormInput>
        </form>
      </Container>
    </Box>
  );
};

export default YieldCalculator;
