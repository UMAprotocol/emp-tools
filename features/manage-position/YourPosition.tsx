import styled from "styled-components";
import { Typography } from "@material-ui/core";
import { utils } from "ethers";

import Position from "../../containers/Position";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import Totals from "../../containers/Totals";
import PriceFeed from "../../containers/PriceFeed";
import EmpState from "../../containers/EmpState";

import { getLiquidationPrice } from "../../utils/getLiquidationPrice";

const { formatUnits: fromWei, parseBytes32String: hexToUtf8 } = utils;

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
    cRatio,
    withdrawAmt,
    pendingWithdraw,
    pendingTransfer,
  } = Position.useContainer();
  const { empState } = EmpState.useContainer();
  const { symbol: collSymbol, decimals: collDec } = Collateral.useContainer();
  const { symbol: tokenSymbol } = Token.useContainer();
  const { latestPrice, sourceUrl } = PriceFeed.useContainer();
  const { collateralRequirement: collReq, priceIdentifier } = empState;
  const defaultMissingDataDisplay = "N/A";

  if (
    tokens !== null &&
    collateral !== null &&
    cRatio !== null &&
    gcr !== null &&
    collSymbol !== null &&
    collDec !== null &&
    tokenSymbol !== null &&
    latestPrice !== null &&
    collReq !== null &&
    sourceUrl !== undefined &&
    priceIdentifier !== null &&
    withdrawAmt !== null &&
    pendingWithdraw !== null &&
    pendingTransfer !== null
  ) {
    const pricedCR =
      latestPrice !== 0 ? (cRatio / latestPrice).toFixed(4) : "0";
    const pricedGCR = latestPrice !== 0 ? (gcr / latestPrice).toFixed(4) : "0";
    const collReqFromWei = parseFloat(fromWei(collReq, collDec));
    const liquidationPrice = getLiquidationPrice(
      collateral,
      tokens,
      collReqFromWei
    ).toFixed(4);
    const priceIdUtf8 = hexToUtf8(priceIdentifier);

    return renderComponent(
      pricedCR,
      pricedGCR,
      collReqFromWei.toFixed(4),
      liquidationPrice,
      collateral.toFixed(4),
      collSymbol,
      tokens.toFixed(4),
      tokenSymbol,
      Number(latestPrice).toFixed(6),
      priceIdUtf8,
      withdrawAmt.toFixed(4),
      pendingWithdraw,
      pendingTransfer,
      sourceUrl
    );
  } else {
    return renderComponent();
  }

  function renderComponent(
    pricedCR: string = defaultMissingDataDisplay,
    pricedGCR: string = defaultMissingDataDisplay,
    collReqFromWei: string = defaultMissingDataDisplay,
    liquidationPrice: string = defaultMissingDataDisplay,
    _collateral: string = "0",
    _collSymbol: string = "",
    _tokens: string = "0",
    _tokenSymbol: string = "",
    _latestPrice: string = "",
    priceIdUtf8: string = defaultMissingDataDisplay,
    _withdrawAmt: string = "0",
    _pendingWithdraw: string = defaultMissingDataDisplay,
    _pendingTransfer: string = defaultMissingDataDisplay,
    pricefeedUrl: string = "https://api.pro.coinbase.com/products/"
  ) {
    return (
      <Container>
        <Typography variant="h5">Your Position</Typography>
        <Status>
          <Label>Collateral supplied: </Label>
          {`${_collateral} ${_collSymbol}`}
        </Status>
        <Status>
          <Label>Tokens outstanding: </Label>
          {`${_tokens} ${_tokenSymbol}`}
        </Status>
        <Status>
          <Label>
            Estimated identifier price (
            <Link href={pricefeedUrl} target="_blank" rel="noopener noreferrer">
              Coinbase Pro
            </Link>
            ):{" "}
          </Label>
          {_latestPrice}
        </Status>
        <Status>
          <Label>(CR) Collateralization ratio:</Label>
          {` ${pricedCR} (${_collSymbol} / ${_tokenSymbol})`}
        </Status>
        <Status>
          <Label>(GCR) Global collateralization ratio:</Label>
          {` ${pricedGCR} (${_collSymbol} / ${_tokenSymbol})`}
        </Status>
        <Status>
          <Label>Liquidation Requirement:</Label>
          {` ${collReqFromWei}`}
        </Status>
        <Status>
          <Label>Liquidation Price:</Label>
          {` ${liquidationPrice} (${priceIdUtf8})`}
        </Status>
        <Status>
          <Label>Collateral pending/available to withdraw:</Label>
          {` ${_withdrawAmt} ${_collSymbol}`}
        </Status>
        <Status>
          <Label>Pending withdrawal request:</Label>
          {` ${_pendingWithdraw}`}
        </Status>
      </Container>
    );
  }
};

export default YourPosition;
