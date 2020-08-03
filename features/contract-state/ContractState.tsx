import { Box, Grid, Typography } from "@material-ui/core";
import styled from "styled-components";
import GeneralInfo from "./GeneralInfo";
import DisputeParams from "./DisputeParams";
import Totals from "./Totals";

import Position from "../../containers/Position";

const Important = styled(Typography)`
  color: red;
  background: black;
  display: inline-block;
  margin-bottom: 20px;
`;

const ContractState = () => {
  const { liquidations } = Position.useContainer();

  return (
    <Box pt={4}>
      {liquidations !== null && liquidations.length > 0 && (
        <Important>
          IMPORTANT! You have one or more active liquidations against your
          position, see more details by clicking "Manage Position"
        </Important>
      )}
      <Grid container spacing={4}>
        <Totals />
      </Grid>
      <Box pt={4}>
        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <GeneralInfo />
          </Grid>
          <Grid item md={6} xs={12}>
            <DisputeParams />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ContractState;
