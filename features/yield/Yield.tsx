import { Box, Typography } from "@material-ui/core";
import styled from "styled-components";

import YieldCalculator from "./YieldCalculator";
import BalancerData from "./BalancerData";

const OutlinedContainer = styled.div`
  padding: 1rem;
  border: 1px solid #434343;
`;

const Yield = () => {
  return (
    <Box>
      <Box pb={4}>
        <Typography>
          <a
            href="https://twitter.com/danrobinson/status/1169689525536215040"
            target="_blank"
            rel="noopener noreferrer"
          >
            yTokens
          </a>
          , like yUSD, are expiring tokens that have fixed-rate returns because
          they will be redeemable for exactly 1 USD worth of collateral at
          expiry. To use this calculator enter in the current yToken price and
          the Days to expiry. An implied yearly APR is shown. To learn more
          about yUSD specifically, read the UMA Medium post{" "}
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
      <Box pb={4}>
        <OutlinedContainer>
          <BalancerData />
        </OutlinedContainer>
      </Box>
      <Box pb={4}>
        <OutlinedContainer>
          <YieldCalculator />
        </OutlinedContainer>
      </Box>
    </Box>
  );
};

export default Yield;
