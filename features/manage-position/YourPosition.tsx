import styled from "styled-components";
import { Typography, Box } from "@material-ui/core";
import { ethers, BigNumberish } from "ethers";

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

const fromWei = (x: BigNumberish, u = 18) => ethers.utils.formatUnits(x, u);

const YourPosition = () => {
  const { gcr } = Totals.useContainer();
  const {
    tokens,
    collateral,
    withdrawAmt,
    pendingTransfer,
  } = Position.useContainer();
  const { symbol: collSymbol, decimals: collDec } = Collateral.useContainer();
  const { symbol: tokenSymbol, decimals: tokenDec } = Token.useContainer();

  const ready = tokens && collateral && collSymbol && tokenSymbol;

  const collateralzationRatio =
    collateral && tokens && collDec && tokenDec
      ? parseFloat(fromWei(collateral, collDec)) /
        parseFloat(fromWei(tokens, tokenDec))
      : null;

  return (
    <Container>
      <Typography variant="h5">Your Position</Typography>
      <Status>
        <Label>Collateral supplied: </Label>
        {ready && collateral && collDec
          ? `${fromWei(collateral, collDec)} ${collSymbol}`
          : "N/A"}
      </Status>
      <Status>
        <Label>Tokens outstanding: </Label>
        {ready && tokens && tokenDec
          ? `${fromWei(tokens, tokenDec)} ${tokenSymbol}`
          : "N/A"}
      </Status>
      <Status>
        <Label>Collateralization ratio: </Label>
        {ready && collateralzationRatio ? collateralzationRatio : "N/A"}
      </Status>
      <Status>
        <Label>Global collateralization ratio: </Label>
        {ready && gcr ? gcr : "N/A"}
      </Status>
      <Status>
        <Label>Collateral pending/available to withdraw: </Label>
        {ready && withdrawAmt && collDec
          ? `${fromWei(withdrawAmt, collDec)} ${collSymbol}`
          : "N/A"}
      </Status>
      <Status>
        <Label>Pending transfer request: </Label>
        {ready ? pendingTransfer : "N/A"}
      </Status>
    </Container>
  );
};

export default YourPosition;
