import { Box, Grid, Typography } from "@material-ui/core";
import styled from "styled-components";
import GeneralInfo from "./GeneralInfo";
import { PerpetualInfo } from "./PerpetualInfo";

const Important = styled(Typography)`
  color: red;
  background: black;
  display: inline-block;
  margin-bottom: 20px;
`;

const DataBox = styled(Box)`
  border: 1px solid #434343;
  padding: 1rem 1rem;
  margin: 1rem 1rem;
`;

const Label = styled.div`
  color: #999999;
`;

const Small = styled.span`
  font-size: 1rem;
`;

const LinksContainer = styled.div`
  color: #999;
`;

const SmallLink = styled.a`
  color: white;

  &:not(:first-child) {
    margin-left: 12px;
  }

  &:hover {
    color: red;
  }
`;

const White = styled.span`
  color: white;
`;

const ContractState = () => {
  return (
    <Box pt={4}>
      <Grid container spacing={4}>
        <PerpetualInfo />
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
