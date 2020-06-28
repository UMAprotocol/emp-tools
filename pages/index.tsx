import { useState } from "react";
import styled from "styled-components";
import { Container, Box, Typography, Tab, Tabs } from "@material-ui/core";

import Header from "../features/core/Header";
import ConnectionStatus from "../features/core/ConnectionStatus";
import EmpPicker from "../features/emp-picker/EmpPicker";
import ContractState from "../features/contract-state/ContractState";
import ManagePosition from "../features/manage-position/ManagePosition";

const StyledTabs = styled(Tabs)`
  & .MuiTabs-flexContainer {
    border-bottom: 1px solid #999;
  }
  & .Mui-selected {
    font-weight: bold;
  }
`

export default function Index() {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Container maxWidth={"md"}>
      <Box py={4}>
        <Header />
        <ConnectionStatus />
        <EmpPicker />
        <StyledTabs value={tabIndex} onChange={(_, i) => setTabIndex(i)}>
          <Tab label="General Info" />
          <Tab label="Manage Position" />
        </StyledTabs>
        {tabIndex === 0 && (
          <>
            <Box pt={3} pl={2} maxWidth={800}>
              <Typography>
                <i>
                  The Expiring Multi Party (EMP) smart contract is UMA's most
                  current financial contract template. This UI is a
                  community-made tool to make interfacing with the protocol
                  easier, please use at your own risk.
                </i>
              </Typography>
            </Box>
            <ContractState />
          </>
        )}

        {tabIndex === 1 && <ManagePosition />}
      </Box>
    </Container>
  );
}
