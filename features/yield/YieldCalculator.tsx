import { Box, TextField, Typography, Grid } from "@material-ui/core";
import { useState, useEffect } from "react";
import styled from "styled-components";
import EmpState from "../../containers/EmpState";
import Balancer from "../../containers/Balancer";

const FormInput = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const MS_PER_S = 1000;
const S_PER_DAY = 60 * 60 * 24;
const DAYS_PER_YEAR = 365;

const PLACEHOLDER_PRICE = "0.9875";

// TODO: If the user has not selected an EMP (or has not even connected their web3 provider yet),
// then the EMP's expirationTimestamp will clearly be unavailable. In order to support explorability,
// this is a placeholder `daysToExpiry` that will be the default value for the textfield if no EMP is selected yet.
const PLACEHOLDER_DAYS_TO_EXPIRY = "30";

const YieldCalculator = () => {
  const { empState } = EmpState.useContainer();
  const { expirationTimestamp } = empState;
  const { usdPrice } = Balancer.useContainer();

  const [tokenPrice, setTokenPrice] = useState<string | null>(
    usdPrice ? usdPrice.toString() : null
  );
  const [yieldAmount, setYieldAmount] = useState<number | null>(null);

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
    return (x * 100).toFixed(4);
  };

  // Update the yield whenever the parameters change.
  useEffect(() => {
    setYieldAmount(calculateYield());
  }, [tokenPrice, daysToExpiry]);

  return (
    <span>
      <Typography variant="h5">yUSD Yield Calculator</Typography>
      <form noValidate autoComplete="off">
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <FormInput>
              <TextField
                fullWidth
                type="number"
                label="Current yUSD Price (USD)"
                value={tokenPrice?.toString() || ""}
                onChange={(e) => setTokenPrice(e.target.value)}
                variant="outlined"
                inputProps={{ min: "0", max: "10", step: "0.01" }}
                helperText={`Enter the price of yUSD in $`}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormInput>
          </Grid>
          <Grid item xs={4}>
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
                    ? `Days to expiry for chosen EMP: ${calculateDaysToExpiry()}`
                    : ""
                }
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormInput>
          </Grid>
          <Grid item xs={4}>
            <Box pt={4}>
              <Typography variant="h6">
                Yearly APR for <strong>buyers</strong>:{" "}
                {prettyPercentage(yieldAmount)}%
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </form>
    </span>
  );
};

export default YieldCalculator;
