import styled from "styled-components";
import { Typography } from "@material-ui/core";

import Layout from "../features/core/EMPLayout";
import ContractState from "../features/contract-state/ContractState";

const Blurb = styled.div`
  padding: 1rem;
  border: 1px solid #434343;
`;

export default function Index() {
  return (
    <Layout>
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
          community-made tool to make interfacing with the protocol easier,
          please use at your own risk. The source code can be viewed{" "}
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
    </Layout>
  );
}
