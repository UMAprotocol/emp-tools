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
import Analytics from "../features/analytics/Analytics";

import Collateral from "../containers/Collateral";
import Token from "../containers/Token";
import WethContract from "../containers/WethContract";

import { YIELD_TOKENS } from "../constants/yieldTokens";

import GitHubIcon from "@material-ui/icons/GitHub";
import TwitterIcon from "@material-ui/icons/Twitter";

const StyledTabs = styled(Tabs)`
  & .MuiTabs-flexContainer {
    border-bottom: 1px solid #999;
    width: 200%;
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
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");
  const { address: collAddress } = Collateral.useContainer();
  const { address: tokenAddress } = Token.useContainer();
  const { contract: weth } = WethContract.useContainer();

  const isYieldToken =
    tokenAddress &&
    Object.keys(YIELD_TOKENS).includes(tokenAddress.toLowerCase());

  let options = ["General Info", "Manage Position", "All Positions"];

  if (weth && collAddress?.toLowerCase() == weth.address.toLowerCase()) {
    options.push("Wrap/Unwrap WETH");
  }

  if (isYieldToken) {
    options = options.concat(["yUSD Yield", "Analytics"]);
  }

  // Update selected page if the user toggles between EMPs while selected on
  // invalid pages (i.e on Wrap/Unwrap then moves to uUSDrBTC)
  if (tabIndex > options.length - 1) {
    setSelectedMenuItem("General Info");
    setTabIndex(0);
  }

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (index: number) => {
    setTabIndex(index);
    setAnchorEl(null);
    setSelectedMenuItem(options[index]);
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
          <StyledTabs
            value={tabIndex}
            onChange={(_, index) => handleMenuItemClick(index)}
          >
            {options.map((option, index) => (
              <Tab key={index} label={option} disableRipple />
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
                    <strong>Current page:</strong> {selectedMenuItem}
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
                  key={index}
                  selected={index === tabIndex}
                  onClick={(_) => handleMenuItemClick(index)}
                >
                  {option}
                </MenuItem>
              ))}
            </Menu>
          </div>
        </Hidden>
        {selectedMenuItem === "General Info" && (
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
        {selectedMenuItem === "Manage Position" && <ManagePosition />}
        {selectedMenuItem === "All Positions" && <AllPositions />}
        {selectedMenuItem === "yUSD Yield" && <Yield />}
        {selectedMenuItem === "Wrap/Unwrap WETH" && <Weth />}
        {selectedMenuItem === "Analytics" && <Analytics />}
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
