import styled from "styled-components";
import { Typography, Box } from "@material-ui/core";
import { ethers } from "ethers";

import Position from "../../containers/Position";
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

const fromWei = ethers.utils.formatUnits;

const YourPosition = () => {
  const {
    tokens,
    collateral,
    withdrawAmt,
    pendingTransfer,
  } = Position.useContainer();
  const { symbol: collSymbol } = Collateral.useContainer();
  const { symbol: tokenSymbol } = Token.useContainer();

  return (
    <Container>
      <Typography variant="h5">Your Position</Typography>
      <Status>
        <Label>Tokens outstanding: </Label>
        {tokens && tokenSymbol ? `${fromWei(tokens)} ${tokenSymbol}` : "N/A"}
      </Status>
      <Status>
        <Label>Collateral supplied: </Label>
        {collateral && collSymbol
          ? `${fromWei(collateral)} ${collSymbol}`
          : "N/A"}
      </Status>
      <Status>
        <Label>Collateral pending/available to withdraw: </Label>
        {withdrawAmt && collSymbol
          ? `${fromWei(withdrawAmt)} ${collSymbol}`
          : "N/A"}
      </Status>
      <Status>
        <Label>Pending transfer request: </Label>
        {pendingTransfer || "N/A"}
      </Status>
    </Container>
  );
};

export default YourPosition;
