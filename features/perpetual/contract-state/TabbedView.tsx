import { useState, useEffect, useCallback } from "react";
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

import { ContractInfo } from "../../../containers/ContractList";
import ContractState from "./ContractState";

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

export default function ({ contract }: { contract: ContractInfo }) {
  let options = ["General Info"];
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>(
    "General Info"
  );
  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMenuItemClick = (index: number) => {
    setAnchorEl(null);
    setSelectedMenuItem(options[index]);
  };
  return (
    <>
      <Hidden only={["sm", "xs"]}>
        <StyledTabs
          value={options.indexOf(selectedMenuItem)}
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
                selected={index === options.indexOf(selectedMenuItem)}
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
              The Perpetual (Perp) is{" "}
              <a
                href="https://umaproject.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                UMA
              </a>
              's most current financial smart contract template. This UI is a
              community-made tool to make interfacing with the protocol easier,
              please use at your own risk. The source code can be viewed{" "}
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
    </>
  );
}
