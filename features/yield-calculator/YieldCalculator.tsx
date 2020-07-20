import { Box, TextField, Button, Typography } from "@material-ui/core";
import { FormEvent, useState } from "react";
import styled from "styled-components";
import EmpState from "../../containers/EmpState";

const Container = styled.div`
  padding: 1rem;
  border: 1px solid #434343;
`;

const FormInput = styled.div`
  margin-top: 20px;
`;

const MS_TO_S = 1000;
const S_TO_DAYS = 60 * 60 * 24;
const DAYS_TO_YEAR = 365;

const YieldCalculator = () => {
  const { empState } = EmpState.useContainer();
  const [tokenPrice, setTokenPrice] = useState<number | null>(
    1 - Math.random() * 0.1
  );

  const expirationTimestamp = empState.expirationTimestamp;

  // TODO: Put this in a container and update it every second.
  const calculateDaysToExpiry = () => {
    if (expirationTimestamp) {
      const currentTimestamp = Math.round(Date.now() / MS_TO_S);
      const secondsToExpiry = expirationTimestamp.toNumber() - currentTimestamp;

      return Math.round(secondsToExpiry / S_TO_DAYS);
    } else {
      return 0;
    }
  };
  const [daysToExpiry, setDaysToExpiry] = useState<number>(
    calculateDaysToExpiry()
  );

  const calculateYield = () => {
    if (!tokenPrice || tokenPrice <= 0) {
      return null;
    }
    if (!daysToExpiry || daysToExpiry <= 0) {
      return null;
    }
    const yieldPerUnit =
      Math.pow(1 / tokenPrice, 1 / (DAYS_TO_YEAR / daysToExpiry)) - 1;
    return yieldPerUnit;
  };
  const [yieldAmount, setYieldAmount] = useState<number | null>(
    calculateYield()
  );

  const handleClick = (e: FormEvent) => {
    e.preventDefault();

    setYieldAmount(calculateYield());
  };

  const prettyPercentage = (x: number | null) => {
    if (x === null) return "N/A";
    return (x * 100).toFixed(4);
  };

  return (
    <Box pt={4}>
      <Container>
        <form noValidate autoComplete="off" onSubmit={(e) => handleClick(e)}>
          <Typography variant="h5">yUSD Yield Calculator</Typography>
          <FormInput></FormInput>
          <FormInput>
            <TextField
              type="number"
              label="Current yUSD Price"
              value={tokenPrice !== null ? tokenPrice.toString() : ""}
              onChange={(e) => setTokenPrice(parseFloat(e.target.value))}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormInput>
          <FormInput>
            <TextField
              type="number"
              label="Days to Expiry"
              value={daysToExpiry !== null ? daysToExpiry.toString() : ""}
              onChange={(e) => setDaysToExpiry(parseFloat(e.target.value))}
              helperText={`Expiration time: ${
                expirationTimestamp
                  ? new Date(expirationTimestamp?.toNumber() * 1000)
                  : "N/A"
              }`}
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
              label="APY"
              value={
                yieldAmount !== null ? `${prettyPercentage(yieldAmount)}%` : ""
              }
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormInput>
          <Button type="submit">Calculate</Button>
        </form>
      </Container>
    </Box>
  );
};

export default YieldCalculator;
