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

import Header from "../features/core/Header";

import GitHubIcon from "@material-ui/icons/GitHub";
import TwitterIcon from "@material-ui/icons/Twitter";

import Connection from "../containers/Connection";
import { ContractInfo } from "../containers/ContractList";
import SelectedContract from "../containers/SelectedContract";
import ContractSelector from "../features/contract-selector/ContractSelector";
import PerpetualTabbedView from "../features/perpetual/contract-state/TabbedView";
import EmpTabbedView from "../features/contract-state/TabbedView";

const Blurb = styled.div`
  padding: 1rem;
  border: 1px solid #434343;
`;

function NoContractPage() {
  const { signer } = Connection.useContainer();
  return (
    <Blurb>
      {signer ? (
        <Typography>
          Please Select an UMA contract from the list above.
        </Typography>
      ) : (
        <Typography>Please connect your wallet before continuing.</Typography>
      )}
    </Blurb>
  );
}

export default function Index() {
  const { contract, isValid } = SelectedContract.useContainer();
  // Use callback here will prevent re mounting components unless contract changes
  const selectPage = useCallback(() => {
    console.log("DEBUG!");
    console.log(contract);
    if (!isValid) return <NoContractPage />;
    if (contract == null) return <NoContractPage />;
    switch (contract.type) {
      case "Perpetual":
        return <PerpetualTabbedView contract={contract} />;
      case "EMP":
        return <EmpTabbedView contract={contract} />;
      default:
        return <NoContractPage />;
    }
  }, [contract && contract.type]);

  return (
    <Container maxWidth={"md"}>
      <Box py={4}>
        <Header />
        <ContractSelector />
        {selectPage()}
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
