import styled from "styled-components";
import { Container, Box, Divider } from "@material-ui/core";

import Header from "../features/core/Header";
import ConnectionStatus from "../features/core/ConnectionStatus";
import EmpAddressInput from "../features/emp-picker/EmpAddressInput";
import EmpListButton from "../features/emp-picker/EmpListButton";
import ContractState from "../features/contract-state/ContractState";
import Manager from "../features/manage-position/Manager";

export default function Index() {
  return (
    <Container maxWidth={"md"}>
      <Box py={4}>
        <Header />
        <ConnectionStatus />
        <EmpListButton />
        <EmpAddressInput />
        <ContractState />
        <Divider variant="middle" />
        <Manager />
      </Box>
    </Container>
  );
}
