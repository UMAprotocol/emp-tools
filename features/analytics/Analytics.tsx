import { useState, MouseEvent } from "react";
import { Box, Typography } from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import styled from "styled-components";

import CurrentSponsorsCollateralRatio from "./CurrentSponsorsCollateralRatio";
import CurrentLiquidityProviders from "./CurrentLiquidityProviders";

import Connection from "../../containers/Connection";
import Token from "../../containers/Token";

import { YIELD_TOKENS } from "../../constants/yieldTokens";

const OutlinedContainer = styled.div`
  padding: 1rem;
  border: 1px solid #434343;
`;

const Analytics = () => {
  const { address: tokenAddress } = Token.useContainer();
  const { network } = Connection.useContainer();

  const isYieldToken =
    tokenAddress &&
    Object.keys(YIELD_TOKENS).includes(tokenAddress.toLowerCase());

  const [dialogTabIndex, setDialogTabIndex] = useState<string>("emp-analytics");
  const handleAlignment = (
    event: MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    setDialogTabIndex(newAlignment);
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
        <Box pb={2} pt={0} textAlign="center">
          <ToggleButtonGroup
            value={dialogTabIndex}
            exclusive
            onChange={handleAlignment}
          >
            <ToggleButton value="emp-analytics">EMP Analytics</ToggleButton>
            <ToggleButton value="balancer-pool-analytics">
              Balancer Pool Analytics
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {dialogTabIndex === "emp-analytics" && (
          <Box py={2}>
            <OutlinedContainer>
              <CurrentSponsorsCollateralRatio />
            </OutlinedContainer>
          </Box>
        )}
        {dialogTabIndex === "balancer-pool-analytics" && (
          <Box py={2}>
            <OutlinedContainer>
              <CurrentLiquidityProviders />
            </OutlinedContainer>
          </Box>
        )}
      </Box>
    );
  }
};

export default Analytics;
