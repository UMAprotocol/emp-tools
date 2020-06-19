import { Container, Box, Divider } from "@material-ui/core";

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
        <ContractState />
        {/* <Divider variant="middle" />
        <ManagePosition /> */}
      </Box>
    </Container>
  );
}
