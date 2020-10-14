import { Box, TextField, Typography, Grid, Radio } from "@material-ui/core";
import { useState, useEffect } from "react";
import styled from "styled-components";
import EmpState from "../../containers/EmpState";
import Balancer from "../../containers/Balancer";
import Token from "../../containers/Token";
import { calcApr } from "../../utils/calculators";

const FormInput = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const MS_PER_S = 1000;
const S_PER_DAY = 60 * 60 * 24;
const DAYS_PER_YEAR = 365;

const USER_MODE: { [key: string]: string } = {
  BUY: "buyer",
  SELL: "seller",
};

const YieldCalculator = () => {
  const { empState } = EmpState.useContainer();
  const { expirationTimestamp } = empState;
  const { usdPrice } = Balancer.useContainer();
  const { symbol: tokenSymbol } = Token.useContainer();

  const [tokenPrice, setTokenPrice] = useState<string>("");
  const [daysToExpiry, setDaysToExpiry] = useState<string>("");
  const [yieldAmount, setYieldAmount] = useState<string>("");
  const [selectedUserMode, setSelectedUserMode] = useState<string>(
    USER_MODE.BUY
  );

  function setDefaultValues() {
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

  const calculateYield = (
    _daysToExpiry: number,
    _tokenPrice: number,
    _selectedUserMode: string
  ) => {
    if (_tokenPrice <= 0 || _daysToExpiry <= 0) {
      return null;
    }
    if (_selectedUserMode === USER_MODE.BUY) {
      return calcApr(_tokenPrice, 1, _daysToExpiry);
    }
    return calcApr(1, _tokenPrice, _daysToExpiry);
  };

  const prettyPercentage = (x: number | null) => {
    if (x === null) return "";
    return (x * 100).toFixed(2);
  };

  // Update state whenever EMP selection changes.
  useEffect(() => {
    setDefaultValues();
  }, [empState, usdPrice]);

  // Update yield amount whenever inputs change.
  useEffect(() => {
    const updatedYield = calculateYield(
      Number(daysToExpiry) || 0,
      Number(tokenPrice) || 0,
      selectedUserMode
    );
    setYieldAmount(prettyPercentage(updatedYield));
  }, [daysToExpiry, tokenPrice, selectedUserMode]);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedUserMode(event.target.value);
  };

  return (
    <span>
      <Typography variant="h5">{tokenSymbol} Yield Calculator</Typography>
      <br></br>
      <Typography>
        The yield for {tokenSymbol} changes if you plan on <i>buying</i> it as a
        borrower, looking for a stable yield or <i>selling</i> it as a lender,
        looking to gain levered exposure on your ETH.
      </Typography>
      <Box pt={2}>
        <Typography>
          <strong>Calculator mode: </strong>
        </Typography>
        <Radio
          checked={selectedUserMode === USER_MODE.BUY}
          onChange={handleRadioChange}
          value={USER_MODE.BUY}
        />
        {USER_MODE.BUY}{" "}
        <Radio
          checked={selectedUserMode === USER_MODE.SELL}
          onChange={handleRadioChange}
          value={USER_MODE.SELL}
        />
        {USER_MODE.SELL}
      </Box>
      <form noValidate autoComplete="off">
        <Grid container spacing={2}>
          <Grid item md={4} sm={6} xs={12}>
            <FormInput>
              <TextField
                fullWidth
                type="number"
                label={`Current ${tokenSymbol} Price (USD)`}
                value={tokenPrice}
                onChange={(e) => setTokenPrice(e.target.value)}
                variant="outlined"
                inputProps={{ min: "0", max: "10", step: "0.01" }}
                helperText={`${tokenSymbol} price in USD`}
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
                helperText={`Days to expiry for EMP: ${daysToExpiry}`}
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
                Yearly APR for {selectedUserMode}: {yieldAmount}%
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </form>
    </span>
  );
};

export default YieldCalculator;
