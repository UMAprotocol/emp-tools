import styled from "styled-components";
import { Typography } from "@material-ui/core";

import Position from "../../containers/Position";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import Totals from "../../containers/Totals";

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

const YourPosition = () => {
  const { gcr } = Totals.useContainer();
  const {
    tokens,
    collateral,
    withdrawAmt,
    pendingWithdraw,
    pendingTransfer,
  } = Position.useContainer();
  const { symbol: collSymbol } = Collateral.useContainer();
  const { symbol: tokenSymbol } = Token.useContainer();

  const ready =
    tokens !== null &&
    collateral !== null &&
    collSymbol !== null &&
    tokenSymbol !== null;

  const collateralzationRatio =
    collateral !== null && tokens !== null ? collateral / tokens : null;

  return (
    <Container>
      <Typography variant="h5">Your Position</Typography>
      <Status>
        <Label>Collateral supplied: </Label>
        {ready ? `${collateral} ${collSymbol}` : "N/A"}
      </Status>
      <Status>
        <Label>Tokens outstanding: </Label>
        {ready ? `${tokens} ${tokenSymbol}` : "N/A"}
      </Status>
      <Status>
        <Label>Collateralization ratio: </Label>
        {ready ? collateralzationRatio : "N/A"}
      </Status>
      <Status>
        <Label>Global collateralization ratio: </Label>
        {ready ? gcr : "N/A"}
      </Status>
      <Status>
        <Label>Collateral pending/available to withdraw: </Label>
        {ready ? `${withdrawAmt} ${collSymbol}` : "N/A"}
      </Status>
      <Status>
        <Label>Pending withdrawal request: </Label>
        {ready ? `${pendingWithdraw}` : "N/A"}
      </Status>
      <Status>
        <Label>Pending transfer request: </Label>
        {ready ? pendingTransfer : "N/A"}
      </Status>
    </Container>
  );
};

export default YourPosition;
