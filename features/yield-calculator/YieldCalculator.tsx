import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Typography,
} from "@material-ui/core";
import { FormEvent, useState } from "react";
import { BigNumberish, utils } from "ethers";
import styled from "styled-components";

const ETHEREUM_LOGO_URL =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png";

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const Container = styled.div`
  padding: 1rem;
  border: 1px solid #434343;
`;

const FormInput = styled.div`
  margin-top: 20px;
`;

const YieldCalculator = () => {
  const [tokenAmount, setTokenAmount] = useState<number | null>(100);
  const [tokenPrice, setTokenPrice] = useState<number | null>(
    1 - Math.random() * 0.1
  );

  // TODO: Put this in a container and update it every second.
  const expirationTimestamp = 1598918400;
  const calculateDaysToExpiry = () => {
    const currentTimestamp = Math.round(Date.now() / 1000);
    const secondsToExpiry = expirationTimestamp - currentTimestamp;

    return Math.round(secondsToExpiry / (60 * 60 * 24));
  };
  const [daysToExpiry, setDaysToExpiry] = useState<number | null>(
    calculateDaysToExpiry()
  );

  const calculateYield = () => {
    if (!tokenPrice || tokenPrice <= 0) {
      return null;
    }
    if (!daysToExpiry || daysToExpiry <= 0) {
      return null;
    }
    if (!tokenAmount || daysToExpiry <= 0) {
      return null;
    }
    const yieldPerUnit = Math.pow(1 / tokenPrice, 1 / 365 / daysToExpiry) - 1;
    return yieldPerUnit * tokenAmount;
  };
  const [yieldAmount, setYieldAmount] = useState<number | null>(
    calculateYield()
  );

  const handleClick = (e: FormEvent) => {
    e.preventDefault();

    setYieldAmount(calculateYield());
  };

  return (
    <Box pt={4}>
      <Container>
        <form noValidate autoComplete="off" onSubmit={(e) => handleClick(e)}>
          <Typography variant="h5">yUSD Yield Calculator</Typography>
          <FormInput>
            <TextField
              type="number"
              label="yUSD Quantity"
              value={tokenAmount !== null ? tokenAmount : ""}
              onChange={(e) => setTokenAmount(parseFloat(e.target.value))}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormInput>
          <FormInput>
            <TextField
              type="number"
              label="Current yUSD Price"
              value={tokenPrice !== null ? tokenPrice : ""}
              onChange={(e) => setTokenPrice(parseFloat(e.target.value))}
              helperText={`Sourced from https://balancer.exchange`}
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
              value={daysToExpiry !== null ? daysToExpiry : ""}
              onChange={(e) => setDaysToExpiry(parseFloat(e.target.value))}
              helperText={`Expiration time: ${new Date(
                expirationTimestamp * 1000
              )}`}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormInput>
          <FormInput>
            <TextField
              disabled
              type="number"
              label="Yield"
              value={yieldAmount !== null ? yieldAmount : ""}
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
