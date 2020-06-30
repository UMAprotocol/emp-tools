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
              <Small> {collSymbol}</Small>
            </Tooltip>
          </Typography>
          <Label>
            of <White>collateral</White> supplied
          </Label>
          <LinksContainer>
            <SmallLink
              href={`https://etherscan.io/address/${collAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Etherscan
            </SmallLink>
            <SmallLink
              href={`https://uniswap.info/token/${collAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Uniswap
            </SmallLink>
          </LinksContainer>
        </DataBox>
      </Grid>

      <Grid item xs={6}>
        <DataBox>
          <Typography variant="h4">
            <strong>
              {loading ? "N/A" : Number(totalTokens).toLocaleString()}
            </strong>
            <Tooltip title="Etherscan Link">
              <Small> {tokenSymbol}</Small>
            </Tooltip>
          </Typography>
          <Tooltip title="This is the total number of tokens minted minus the total number of tokens redeemed.">
            <Label>
              of <White>synthetic tokens</White> outstanding
            </Label>
          </Tooltip>
          <LinksContainer>
            <SmallLink
              href={`https://etherscan.io/address/${tokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Etherscan
            </SmallLink>
            <SmallLink
              href={`https://uniswap.info/token/${tokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Uniswap
            </SmallLink>
          </LinksContainer>
        </DataBox>
      </Grid>
    </>
  );
};

export default Totals;
