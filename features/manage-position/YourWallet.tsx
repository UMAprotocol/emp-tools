import styled from "styled-components";
import { Typography } from "@material-ui/core";

import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import PriceFeed from "../../containers/PriceFeed";

const Label = styled.span`
  color: #999999;
`;

const Status = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Container = styled.div`
  padding: 1rem;
  border: 1px solid #434343;
`;

const YourWallet = () => {
  const {
    symbol: collSymbol,
    balance: collBalance,
  } = Collateral.useContainer();
  const { symbol: tokenSymbol, balance: tokenBalance } = Token.useContainer();
  const { latestPrice, sourceUrl } = PriceFeed.useContainer();

  const ready =
    tokenBalance !== null &&
    collBalance !== null &&
    collSymbol !== null &&
    tokenSymbol !== null &&
    latestPrice !== null;

  return (
    <Container>
      <Typography variant="h5">Your Wallet</Typography>
      <Status>
        <Label>Collateral balance: </Label>
        {ready ? `${collBalance} ${collSymbol}` : "N/A"}
      </Status>
      <Status>
        <Label>Token balance: </Label>
        {ready ? `${tokenBalance} ${tokenSymbol}` : "N/A"}
      </Status>
    </Container>
  );
};

export default YourWallet;
