import { useState, MouseEvent } from "react";
import { Box, Typography } from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import styled from "styled-components";

import YieldCalculator from "./YieldCalculator";
import BalancerData from "./BalancerData";
import FarmingCalculator from "./FarmingCalculator";

import Connection from "../../containers/Connection";
import Token from "../../containers/Token";

import { YIELD_TOKENS } from "../../constants/yieldTokens";

const OutlinedContainer = styled.div`
  padding: 1rem;
  border: 1px solid #434343;
`;

const Yield = () => {
  const { network } = Connection.useContainer();
  const { address: tokenAddress } = Token.useContainer();
  const { symbol: tokenSymbol } = Token.useContainer();

  const isYieldToken =
    tokenAddress &&
    Object.keys(YIELD_TOKENS).includes(tokenAddress.toLowerCase());

  const [dialogTabIndex, setDialogTabIndex] = useState<string>(
    "farming-calculator"
  );
  const handleAlignment = (
    event: MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    if (newAlignment) {
      setDialogTabIndex(newAlignment);
    }
  };

  if (network === null || network.chainId !== 1 || !isYieldToken) {
    return (
      <Box py={2}>
        <Typography>
          <i>
            Please first connect to Mainnet, and then select a yield token (i.e.
            yUSD).
          </i>
        </Typography>
      </Box>
    );
  } else {
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
            , like {tokenSymbol}, are expiring tokens with a fixed-rate return
            and are redeemable for exactly 1 USD worth of collateral at expiry.
            To learn more about {tokenSymbol} see the UMA Medium post{" "}
            <a
              href="https://medium.com/uma-project/the-yield-dollar-on-uma-3a492e79069f"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
            , and to learn about rolling between expiries see the article{" "}
            <a
              href="https://medium.com/uma-project/umas-liquidity-mining-pilot-retro-and-rollover-e1ba8614339"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
            .
          </Typography>
        </Box>
        <Box pb={2}>
          <OutlinedContainer>
            <BalancerData />
          </OutlinedContainer>
        </Box>
        <Box py={1} textAlign="center">
          <ToggleButtonGroup
            value={dialogTabIndex}
            exclusive
            onChange={handleAlignment}
          >
            <ToggleButton value="farming-calculator">
              Liquidity Mining
            </ToggleButton>
            <ToggleButton value="yusd-calculator">yield dollar</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {dialogTabIndex === "farming-calculator" && (
          <Box py={2}>
            <OutlinedContainer>
              <FarmingCalculator />
            </OutlinedContainer>
          </Box>
        )}
        {dialogTabIndex === "yusd-calculator" && (
          <Box py={2}>
            <OutlinedContainer>
              <YieldCalculator />
            </OutlinedContainer>
          </Box>
        )}
      </Box>
    );
  }
};

export default Yield;
