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

const YieldCalculator = () => {
  const { empState } = EmpState.useContainer();
  const { expirationTimestamp } = empState;
  const { usdPrice } = Balancer.useContainer();

  const [tokenPrice, setTokenPrice] = useState<string>("");
  const [daysToExpiry, setDaysToExpiry] = useState<string>("");
  const [yieldAmount, setYieldAmount] = useState<string>("");

  function setEmpValues() {
    if (expirationTimestamp !== null && usdPrice !== null) {
      const calculateDaysToExpiry = () => {
        const currentTimestamp = Math.round(Date.now() / MS_PER_S);
        const secondsToExpiry =
          expirationTimestamp.toNumber() - currentTimestamp;

        return Math.round(secondsToExpiry / S_PER_DAY);
      };

      const daysToExpiry = calculateDaysToExpiry();

      setTokenPrice(usdPrice.toString());
      setDaysToExpiry(daysToExpiry.toString());
    }
  }

  const calculateYield = (_daysToExpiry: number, _tokenPrice: number) => {
    if (_tokenPrice <= 0 || _daysToExpiry <= 0) {
      return null;
    }

    // `yieldPerUnit` = (FACE/yUSD_PX)^(1/(365/DAYS_TO_EXP)) - 1,
    // where FACE = $1. More details: https://www.bankrate.com/glossary/a/apy-annual-percentage-yield/
    const yieldPerUnit =
      Math.pow(1 / _tokenPrice, 1 / (_daysToExpiry / DAYS_PER_YEAR)) - 1;
    return yieldPerUnit;
  };

  const prettyPercentage = (x: number | null) => {
    if (x === null) return "";
    return (x * 100).toFixed(2);
  };

  // Update state whenever EMP selection changes.
  useEffect(() => {
    setEmpValues();
  }, [empState]);

  // Update yield amount whenever inputs change.
  useEffect(() => {
    const updatedYield = calculateYield(
      Number(daysToExpiry) || 0,
      Number(tokenPrice) || 0
    );
    setYieldAmount(prettyPercentage(updatedYield));
  }, [daysToExpiry, tokenPrice]);

  return (
    <span>
      <Typography variant="h5">yUSD Yield Calculator</Typography>
      <form noValidate autoComplete="off">
        <Grid container spacing={2}>
          <Grid item md={4} sm={6} xs={12}>
            <FormInput>
              <TextField
                fullWidth
                type="number"
                label="Current yUSD Price (USD)"
                value={tokenPrice}
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
          <Grid item md={4} sm={6} xs={12}>
            <FormInput>
              <TextField
                fullWidth
                type="number"
                label="Days to Expiry"
                value={daysToExpiry}
                onChange={(e) => setDaysToExpiry(e.target.value)}
                inputProps={{ min: "0", step: "1" }}
                helperText={`Days to expiry for chosen EMP: ${daysToExpiry}`}
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormInput>
          </Grid>
          <Grid item md={4} sm={12} xs={12}>
            <Box pt={1} textAlign="center">
              <Typography variant="h6">
                Yearly APR for <strong>buyers</strong>: {yieldAmount}%
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </form>
    </span>
  );
};

export default YieldCalculator;
