import { Box, TextField, Typography, Grid, Hidden } from "@material-ui/core";
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

  // We set this state var `daysToExpiry` after declaring `calculateDaysToExpiry()` because we first want to check if its value is
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
    if (x === null) return "";
    return (x * 100).toFixed(2);
  };

  // Update the yield whenever the parameters change.
  useEffect(() => {
    setYieldAmount(calculateYield());
  }, [tokenPrice, daysToExpiry]);

  return (
    <Box>
      <Box pb={4}>
        <Typography>
          yUSD is a fixed yielding, expiring token that will be redeemable for
          exactly 1 USD worth of ETH at expiry. To use this calculator enter in
          the current yUSD price and the Days to expiry. An implied yearly APR
          is shown. To learn more about yUSD see the UMA Medium post{" "}
          <a
            href="https://medium.com/uma-project/the-yield-dollar-on-uma-3a492e79069f"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </Typography>
      </Box>
      <Container>
        <Typography variant="h5">yUSD Yield Calculator</Typography>
        <form noValidate autoComplete="off">
          <Grid container spacing={3}>
            <Grid item md={4} xs={6}>
              <FormInput>
                <TextField
                  fullWidth
                  type="number"
                  label="Current yUSD Price (USD)"
                  value={tokenPrice?.toString() || ""}
                  onChange={(e) => setTokenPrice(e.target.value)}
                  variant="outlined"
                  inputProps={{ min: "0", max: "10", step: "0.01" }}
                  helperText={`Enter the market price`}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormInput>
            </Grid>
            <Grid item md={4} xs={6}>
              <FormInput>
                <TextField
                  fullWidth
                  type="number"
                  label="Days to Expiry"
                  value={daysToExpiry?.toString() || ""}
                  onChange={(e) => setDaysToExpiry(e.target.value)}
                  inputProps={{ min: "0", max: "10", step: "1" }}
                  helperText={
                    calculateDaysToExpiry()
                      ? `Days to expiry for EMP: ${calculateDaysToExpiry()}`
                      : ""
                  }
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormInput>
            </Grid>
            <Grid item md={4} xs={12}>
              <Hidden only={["sm", "xs"]}>
                <Box pt={4}>
                  <Typography variant="h6">
                    Yearly APR: {prettyPercentage(yieldAmount)}%
                  </Typography>
                </Box>
              </Hidden>
              <Hidden only={["md", "lg", "xl"]}>
                <Box pt={0} textAlign="center">
                  <Typography variant="h6">
                    Yearly APR: {prettyPercentage(yieldAmount)}%
                  </Typography>
                </Box>
              </Hidden>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Box>
  );
};

export default YieldCalculator;
