import styled from "styled-components";
import { Box, Grid, Typography, Button } from "@material-ui/core";

import TotalsContainer from "../../containers/Totals";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import Etherscan from "../../containers/Etherscan";

import Connection from "../../containers/Connection";
import { getExchangeInfo } from "../../utils/getExchangeLinks";

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
  const { provider } = Connection.useContainer();
  const { totalCollateral, totalTokens } = TotalsContainer.useContainer();
  const {
    symbol: collSymbol,
    address: collAddress,
  } = Collateral.useContainer();
  const { symbol: tokenSymbol, address: tokenAddress } = Token.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();
  const exchangeInfo = getExchangeInfo(tokenSymbol);
  const defaultMissingDataDisplay = "N/A";

  if (
    totalCollateral !== null &&
    totalTokens !== null &&
    collSymbol !== null &&
    tokenSymbol !== null &&
    exchangeInfo !== undefined &&
    collAddress !== null &&
    tokenAddress !== null &&
    provider !== null
  ) {
    const prettyTotalCollateral = Number(totalCollateral).toLocaleString();
    const prettyTotalTokens = Number(totalTokens).toLocaleString();
    const prettyCollSymbol = collSymbol;
    const prettyTokenSymbol = tokenSymbol;
    const getExchangeLinkCollateral = exchangeInfo.getExchangeUrl(collAddress);
    const getExchangeLinkToken = exchangeInfo.getExchangeUrl(tokenAddress);
    const exchangeName = exchangeInfo.name;

    const addTokenToMetamask = () => {
      // Add token to users metamask wallet.
      if (provider == null) return;

      // @ts-ignore
      provider.send("wallet_watchAsset", {
        // @ts-ignore
        type: "ERC20",
        options: {
          address: tokenAddress,
          symbol: tokenSymbol.substring(0, 6),
          name: "test",
          decimals: 18,
          image:
            "https://etherscan.io/token/images/yusdsynthetictokenexpiring1september2020_32.png",
        },
        id: Math.round(Math.random() * 100000),
      });
    };

    return renderComponent(
      prettyTotalCollateral,
      prettyTotalTokens,
      prettyCollSymbol,
      prettyTokenSymbol,
      collAddress,
      tokenAddress,
      getExchangeLinkCollateral,
      getExchangeLinkToken,
      exchangeName,
      addTokenToMetamask
    );
  } else {
    return renderComponent();
  }

  function renderComponent(
    prettyTotalCollateral: string = defaultMissingDataDisplay,
    prettyTotalTokens: string = defaultMissingDataDisplay,
    prettyCollSymbol: string = "",
    prettyTokenSymbol: string = "",
    collAddress: string = "",
    tokenAddress: string = "",
    getExchangeLinkCollateral: string = "",
    getExchangeLinkToken: string = "",
    exchangeName: string = "Uniswap",
    addTokenToMetamask: any = null
  ) {
    return (
      <>
        <Grid item md={6} xs={12}>
          <DataBox>
            <Typography variant="h4">
              <strong>{prettyTotalCollateral}</strong>
              <Small> {prettyCollSymbol}</Small>
            </Typography>
            <Label>
              of <White>collateral</White> supplied
            </Label>
            <LinksContainer>
              {collAddress !== "" && (
                <SmallLink
                  href={getEtherscanUrl(collAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Etherscan
                </SmallLink>
              )}
              {getExchangeLinkCollateral !== "" && (
                <SmallLink
                  href={getExchangeLinkCollateral}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {exchangeName}
                </SmallLink>
              )}
            </LinksContainer>
          </DataBox>
        </Grid>

        <Grid item md={6} xs={12}>
          <DataBox>
            <Typography variant="h4">
              <strong>{prettyTotalTokens}</strong>
              <Small> {prettyTokenSymbol}</Small>
            </Typography>
            <Label>
              of <White>synthetic tokens</White> outstanding
            </Label>
            <LinksContainer>
              {tokenAddress !== "" && (
                <SmallLink
                  href={getEtherscanUrl(tokenAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Etherscan
                </SmallLink>
              )}

              {getExchangeLinkToken !== "" && (
                <SmallLink
                  href={getExchangeLinkToken}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {exchangeName}
                </SmallLink>
              )}

              {tokenAddress !== "" && (
                <SmallLink href="#" onClick={addTokenToMetamask}>
                  Add to Metamask
                </SmallLink>
              )}
            </LinksContainer>
          </DataBox>
        </Grid>
      </>
    );
  }
};

export default Totals;
