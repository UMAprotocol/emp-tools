import { Box, TextField, Typography, Grid, Radio } from "@material-ui/core";
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
  const [selectedUserMode, setSelectedUserMode] = useState<string | null>(
    "buyer"
  );

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedUserMode(event.target.value);
  };

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
    const flipSign = selectedUserMode === "buyer" ? 1 : -1;
    return yieldPerUnit * flipSign;
  };

  const prettyPercentage = (x: number | null) => {
    if (x === null) return "";
    return (x * 100).toFixed(2);
  };

  // Update the yield whenever the parameters change.
  useEffect(() => {
    setYieldAmount(calculateYield());
  }, [selectedUserMode, tokenPrice, daysToExpiry]);

  return (
    <span>
      <Typography variant="h5">yUSD Yield Calculator</Typography>
      <Typography>
        The Yield for yUSD changes if you plan on <i>buying</i> it as a
        borrower, looking for a stable yield or <i>selling</i> it as a lender,
        looking to gain levered exposure on your ETH.
      </Typography>
      <Box pt={2}>
        <Typography>
          <strong>Calculator mode: </strong>
          <Radio
            checked={selectedUserMode === "buyer"}
            onChange={handleRadioChange}
            value="buyer"
          />
          buyer{" "}
          <Radio
            checked={selectedUserMode === "seller"}
            onChange={handleRadioChange}
            value="seller"
          />
          seller
        </Typography>
      </Box>
      <form noValidate autoComplete="off">
        <Grid container spacing={2}>
          <Grid item md={4} sm={6} xs={12}>
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
          <Grid item md={4} sm={6} xs={12}>
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
          <Grid item md={4} sm={12} xs={12}>
            <Box pt={1} textAlign="center">
              <Typography variant="h6">
                Yearly APR for {selectedUserMode}:{" "}
                <strong>{prettyPercentage(yieldAmount)}%</strong>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </form>
    </span>
  );
};

export default YieldCalculator;
