import { Box, Grid } from "@material-ui/core";
import GeneralInfo from "./GeneralInfo";
import DisputeParams from "./DisputeParams";
import Totals from "./Totals";

const ContractState = () => {
  return (
    <Box py={4}>
      <Grid container spacing={4}>
        <Totals />
      </Grid>
      <Box pt={4}>
        <GeneralInfo />
        <DisputeParams />
      </Box>
    </Box>
  );
};

export default ContractState;
