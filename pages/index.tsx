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

import GitHubIcon from "@material-ui/icons/GitHub";

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

  const options = [
    "General Info",
    "Manage Position",
    "All Positions",
    "Wrap/Unwrap WETH",
    "yUSD Yield",
  ];

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

        {tabIndex === 3 && <Weth />}

        {tabIndex === 4 && <Yield />}
      </Box>
      <Box py={4} textAlign="center">
        <IconButton
          style={{ marginRight: `8px` }}
          target="_blank"
          href="https://github.com/UMAprotocol/emp-tools"
        >
          <GitHubIcon />
        </IconButton>
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
