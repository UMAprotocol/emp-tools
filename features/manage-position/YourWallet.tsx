import styled from "styled-components";
import { Typography } from "@material-ui/core";

import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";

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

  if (
    tokenBalance !== null &&
    collBalance !== null &&
    collSymbol !== null &&
    tokenSymbol !== null
  ) {
    return renderComponent(
      tokenBalance.toFixed(4),
      collBalance.toFixed(4),
      collSymbol,
      tokenSymbol
    );
  } else {
    return renderComponent();
  }

  function renderComponent(
    _tokenBalance: string = "0",
    _collBalance: string = "0",
    _collSymbol: string = "",
    _tokenSymbol: string = ""
  ) {
    return (
      <Container>
        <Typography variant="h5">Your Wallet</Typography>
        <Status>
          <Label>Collateral balance: </Label>
          {`${_collBalance} ${_collSymbol}`}
        </Status>
        <Status>
          <Label>Token balance: </Label>
          {`${_tokenBalance} ${_tokenSymbol}`}
        </Status>
      </Container>
    );
  }
};

export default YourWallet;
