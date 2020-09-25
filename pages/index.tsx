import { useState } from "react";
import styled from "styled-components";
import {
  Container,
  Box,
  Typography,
  Tab,
  Tabs,
  Hidden,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Grid,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

import Header from "../features/core/Header";
import ContractState from "../features/contract-state/ContractState";
import ManagePosition from "../features/manage-position/ManagePosition";
import EmpSelector from "../features/emp-selector/EmpSelector";
import AllPositions from "../features/all-positions/AllPositions";
import Weth from "../features/weth/Weth";
import Yield from "../features/yield/Yield";

import Collateral from "../containers/Collateral";
import Token from "../containers/Token";
import WethContract from "../containers/WethContract";

import { YIELD_TOKENS } from "../constants/yieldTokens";

import GitHubIcon from "@material-ui/icons/GitHub";
import TwitterIcon from "@material-ui/icons/Twitter";

const StyledTabs = styled(Tabs)`
  & .MuiTabs-flexContainer {
    border-bottom: 1px solid #999;
  }
  & .Mui-selected {
    font-weight: bold;
  }
  padding-bottom: 2rem;
`;

const Blurb = styled.div`
  padding: 1rem;
  border: 1px solid #434343;
`;

export default function Index() {
  const [tabIndex, setTabIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { address: collAddress } = Collateral.useContainer();
  const { address: tokenAddress } = Token.useContainer();
  const { contract: weth } = WethContract.useContainer();

  const isYieldToken =
    tokenAddress &&
    Object.keys(YIELD_TOKENS).includes(tokenAddress.toLowerCase());

  const options = ["General Info", "Manage Position", "All Positions"];

  if (isYieldToken) {
    options.push("yUSD Yield");
  }

  if (weth && collAddress?.toLowerCase() == weth.address.toLowerCase()) {
    options.push("Wrap/Unwrap WETH");
  }

  // Update selected page if the user toggles between EMPs while selected on
  // invalid pages (i.e on Wrap/Unwrap then moves to uUSDrBTC)
  if (tabIndex > options.length - 1) {
    setTabIndex(0);
  }

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setSelectedIndex(index);
    setAnchorEl(null);
    setTabIndex(index);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container maxWidth={"md"}>
      <Box py={4}>
        <Header />
        <EmpSelector />
        <Hidden only={["sm", "xs"]}>
          <StyledTabs value={tabIndex} onChange={(_, i) => setTabIndex(i)}>
            {options.map((option, index) => (
              <Tab key={option} label={option} disableRipple />
            ))}
          </StyledTabs>
        </Hidden>
        <Hidden only={["md", "lg", "xl"]}>
          <div>
            <Box pt={1} pb={2}>
              <Grid container spacing={2}>
                <Grid item>
                  <Button variant="outlined" onClick={handleClickListItem}>
                    <MenuIcon />
                  </Button>
                </Grid>
                <Grid item>
                  <Typography style={{ marginTop: `8px` }}>
                    <strong>Current page:</strong> {options[selectedIndex]}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {options.map((option, index) => (
                <MenuItem
                  key={option}
                  selected={index === selectedIndex}
                  onClick={(event) => handleMenuItemClick(event, index)}
                >
                  {option}
                </MenuItem>
              ))}
            </Menu>
          </div>
        </Hidden>
        {tabIndex === 0 && (
          <>
            <Blurb>
              <Typography>
                The Expiring Multi Party (EMP) is{" "}
                <a
                  href="https://umaproject.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  UMA
                </a>
                's most current financial smart contract template. This UI is a
                community-made tool to make interfacing with the protocol
                easier, please use at your own risk. The source code can be
                viewed{" "}
                <a
                  href="https://github.com/UMAprotocol/emp-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                </a>
                . UMA's main Github can be viewed{" "}
                <a
                  href="https://github.com/UMAprotocol/protocol"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                </a>
                .
              </Typography>
            </Blurb>
            <ContractState />
          </>
        )}

        {tabIndex === 1 && <ManagePosition />}

        {tabIndex === 2 && <AllPositions />}

        {tabIndex === 3 && <Yield />}

        {tabIndex === 4 && <Weth />}
      </Box>
      <Box py={4} textAlign="center">
        <IconButton
          style={{ marginRight: `8px` }}
          target="_blank"
          href="https://github.com/UMAprotocol/emp-tools"
          size="medium"
        >
          <GitHubIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          style={{ marginRight: `8px` }}
          target="_blank"
          href="https://twitter.com/umaprotocol"
          size="medium"
        >
          <TwitterIcon fontSize="inherit" />
        </IconButton>
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginRight: `16px` }}
        >
          <strong>Terms</strong>
        </a>
        <a
          href="https://vercel.com/?utm_source=uma%2Femp-tools"
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>Powered by ▲ Vercel</strong>
        </a>
      </Box>
    </Container>
  );
}
