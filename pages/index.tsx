import { useState } from "react";
import styled from "styled-components";
import { Container, Box, Typography, Tab, Tabs } from "@material-ui/core";

import Header from "../features/core/Header";
import ContractState from "../features/contract-state/ContractState";
import ManagePosition from "../features/manage-position/ManagePosition";
import EmpSelector from "../features/emp-selector/EmpSelector";

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
  return (
    <Container maxWidth={"md"}>
      <Box py={4}>
        <Header />
        <EmpSelector />
        <StyledTabs value={tabIndex} onChange={(_, i) => setTabIndex(i)}>
          <Tab label="General Info" disableRipple />
          <Tab label="Manage Position" disableRipple />
        </StyledTabs>
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
                  href="https://github.com/adrianmcli/emp-tools"
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
      </Box>
    </Container>
  );
}
