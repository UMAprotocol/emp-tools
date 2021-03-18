import { Box, Grid, Typography } from "@material-ui/core";
import styled from "styled-components";
import GeneralInfo from "./GeneralInfo";
import Totals from "../../core/Totals";

const Important = styled(Typography)`
  color: red;
  background: black;
  display: inline-block;
  margin-bottom: 20px;
`;

const ContractState = () => {
  return (
    <Box pt={4}>
      <Grid container spacing={4}>
        <Totals />
      </Grid>
      <Box pt={4}>
        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <GeneralInfo />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ContractState;
