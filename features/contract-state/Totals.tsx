import styled from "styled-components";
import { Box, Grid, Typography, Tooltip } from "@material-ui/core";

import TotalsContainer from "../../containers/Totals";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";

const DataBox = styled(Box)`
  border: 1px solid #434343;
  padding: 1rem 2rem;
`;

const Label = styled.div`
  color: #999999;
`;

const SmallLink = styled.a`
  font-size: 1rem;
  color: white;
  margin-left: 12px;
  text-decoration: none;

  &:hover {
    color: red;
  }
`;

const Totals = () => {
  const { totalCollateral, totalTokens } = TotalsContainer.useContainer();
  const {
    symbol: collSymbol,
    address: collAddress,
  } = Collateral.useContainer();
  const { symbol: tokenSymbol, address: tokenAddress } = Token.useContainer();
  const loading =
    !totalCollateral || !totalTokens || !collSymbol || !tokenSymbol;
  return (
    <>
      <Grid item xs={6}>
        <DataBox>
          <Typography variant="h4">
            <strong>
              {loading ? "N/A" : Number(totalCollateral).toLocaleString()}
            </strong>
            <Tooltip title="Etherscan Link">
              <SmallLink
                href={`https://etherscan.io/address/${collAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {collSymbol}
              </SmallLink>
            </Tooltip>
          </Typography>
          <Label>of collateral supplied</Label>
        </DataBox>
      </Grid>

      <Grid item xs={6}>
        <DataBox>
          <Typography variant="h4">
            <strong>
              {loading ? "N/A" : Number(totalTokens).toLocaleString()}
            </strong>
            <Tooltip title="Etherscan Link">
              <SmallLink
                href={`https://etherscan.io/address/${tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tokenSymbol}
              </SmallLink>
            </Tooltip>
          </Typography>
          <Label>of synthetic tokens outstanding</Label>
        </DataBox>
      </Grid>
    </>
  );
};

export default Totals;
