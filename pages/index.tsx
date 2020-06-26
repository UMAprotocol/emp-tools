import { Container, Box, Divider, Typography } from "@material-ui/core";

import Header from "../features/core/Header";
import ConnectionStatus from "../features/core/ConnectionStatus";
import EmpPicker from "../features/emp-picker/EmpPicker";
import ContractState from "../features/contract-state/ContractState";
import ManagePosition from "../features/manage-position/ManagePosition";

export default function Index() {
  return (
    <Container maxWidth={"md"}>
      <Box py={4}>
        <Header />
        <ConnectionStatus />
        <EmpPicker />
        <Box pt={3} pl={2} maxWidth={800}>
          <Typography>
            <i>
              The Expiring Multi Party (EMP) smart contract is UMA's most
              current financial contract template. This UI is a community-made
              tool to make interfacing with the protocol easier, please use at
              your own risk.
            </i>
          </Typography>
        </Box>
        <ContractState />
        <Divider variant="middle" />
        <ManagePosition />
      </Box>
    </Container>
  );
}
