import { Box, Grid } from "@material-ui/core";
import GeneralInfo from "./GeneralInfo";
import DisputeParams from "./DisputeParams";
import Totals from "./Totals";

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
          <Grid item md={6} xs={12}>
            <DisputeParams />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ContractState;
