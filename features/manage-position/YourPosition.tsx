import styled from "styled-components";
import { Typography } from "@material-ui/core";

import Position from "../../containers/Position";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import Totals from "../../containers/Totals";
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
  margin-top: 20px;
  padding: 1rem;
  border: 1px solid #434343;
`;

const Link = styled.a`
  font-size: 14px;
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
  const { latestPrice, sourceUrl } = PriceFeed.useContainer();

  const ready =
    tokens !== null &&
    collateral !== null &&
    collSymbol !== null &&
    tokenSymbol !== null &&
    latestPrice !== null &&
    sourceUrl;

  const collateralizationRatio =
    collateral !== null && tokens !== null ? collateral / tokens : null;
  const pricedCollateralizationRatio =
    collateralizationRatio !== null && latestPrice !== null
      ? collateralizationRatio / Number(latestPrice)
      : null;
  const pricedGcr =
    gcr !== null && latestPrice !== null ? gcr / Number(latestPrice) : null;

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
        <Label>
          Estimated Token price (
          <Link href={sourceUrl} target="_blank" rel="noopener noreferrer">
            Coinbase Pro
          </Link>
          ):{" "}
        </Label>
        {ready ? `${latestPrice?.toLocaleString()}` : "N/A"}
      </Status>
      <Status>
        <Label>(CR) Collateralization ratio: </Label>
        {pricedCollateralizationRatio
          ? `${pricedCollateralizationRatio?.toFixed(
              4
            )} (${collSymbol} / ${tokenSymbol})`
          : "N/A"}
      </Status>
      <Status>
        <Label>(GCR) Global collateralization ratio: </Label>
        {pricedGcr
          ? `${pricedGcr?.toFixed(4)} (${collSymbol} / ${tokenSymbol})`
          : "N/A"}
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
