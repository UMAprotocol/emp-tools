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
    Math.random() * 12 + 240
  );
  const [daysToExpiry, setDaysToExpiry] = useState<number | null>();
  const expirationTimestamp = 1598918400;

  // TODO: Put this in a container and update it every second.
  const calculateDaysToExpiry = () => {
    const currentTimestamp = Math.round(Date.now() / 1000);
    const secondsToExpiry = expirationTimestamp - currentTimestamp;

    return Math.round(secondsToExpiry / (60 * 60 * 24));
  };

  const handleClick = (e: FormEvent) => {
    e.preventDefault();
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
              value={tokenAmount ? tokenAmount : ""}
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
              value={tokenPrice ? tokenPrice : ""}
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
              defaultValue={
                calculateDaysToExpiry() ? calculateDaysToExpiry() : ""
              }
              helperText={`Expiration time: ${new Date(
                expirationTimestamp * 1000
              )}`}
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
