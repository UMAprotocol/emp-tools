import styled from "styled-components";
import { Typography, Grid } from "@material-ui/core";
import { utils } from "ethers";

import Position from "../../containers/Position";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import Totals from "../../containers/Totals";
import PriceFeed from "../../containers/PriceFeed";
import EmpState from "../../containers/EmpState";

import { getLiquidationPrice } from "../../utils/getLiquidationPrice";
import { isPricefeedInvertedFromTokenSymbol } from "../../utils/getOffchainPrice";

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
    tokens: tokenString,
    collateral: collString,
    backingCollateral: backingCollString,
    cRatio,
    withdrawAmt: withdrawAmtString,
    pendingWithdraw,
    pendingTransfer,
  } = Position.useContainer();
  const { empState } = EmpState.useContainer();
  const { symbol: collSymbol, decimals: collDec } = Collateral.useContainer();
  const { symbol: tokenSymbol } = Token.useContainer();
  const { latestPrice } = PriceFeed.useContainer();
  const { collateralRequirement: collReq, priceIdentifier } = empState;
  const defaultMissingDataDisplay = "N/A";

  if (
    tokenString !== null &&
    collString !== null &&
    backingCollString !== null &&
    cRatio !== null &&
    gcr !== null &&
    collSymbol !== null &&
    collDec !== null &&
    tokenSymbol !== null &&
    latestPrice !== null &&
    collReq !== null &&
    priceIdentifier !== null &&
    withdrawAmtString !== null &&
    pendingWithdraw !== null &&
    pendingTransfer !== null
  ) {
    const pricedCR =
      latestPrice !== 0 ? (cRatio / latestPrice).toFixed(4) : "0";
    const pricedGCR = latestPrice !== 0 ? (gcr / latestPrice).toFixed(4) : "0";
    const collReqFromWei = parseFloat(fromWei(collReq));
    const tokens = Number(tokenString);
    const collateral = Number(collString);
    const backingCollateral = Number(backingCollString);
    const withdrawAmt = Number(withdrawAmtString);
    const liquidationPrice = getLiquidationPrice(
      collateral - withdrawAmt,
      tokens,
      collReqFromWei,
      isPricefeedInvertedFromTokenSymbol(tokenSymbol)
    ).toFixed(4);
    const priceIdUtf8 = hexToUtf8(priceIdentifier);
    const prettyLatestPrice = Number(latestPrice).toFixed(6);

    return renderComponent(
      pricedCR,
      pricedGCR,
      collReqFromWei.toFixed(4),
      liquidationPrice,
      collateral.toFixed(4),
      backingCollateral.toFixed(4),
      collSymbol,
      tokens.toFixed(4),
      tokenSymbol,
      prettyLatestPrice,
      priceIdUtf8,
      withdrawAmt.toFixed(4),
      pendingWithdraw,
      pendingTransfer
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
    _backingCollateral: string = "0",
    _collSymbol: string = "",
    _tokens: string = "0",
    _tokenSymbol: string = "",
    _latestPrice: string = "",
    priceIdUtf8: string = defaultMissingDataDisplay,
    _withdrawAmt: string = "0",
    _pendingWithdraw: string = defaultMissingDataDisplay,
    _pendingTransfer: string = defaultMissingDataDisplay
  ) {
    return (
      <Container>
        <Grid container spacing={4}>
          <Grid item md={6} xs={12}>
            <Typography variant="h5">Your Position</Typography>
            <Status>
              <Label>Collateral supplied: </Label>
              {`${_collateral} ${_collSymbol}`}
            </Status>
            <Status>
              <Label>Collateral backing debt: </Label>
              {`${_backingCollateral} ${_collSymbol}`}
            </Status>
            <Status>
              <Label>Token debt: </Label>
              {`${_tokens} ${_tokenSymbol}`}
            </Status>
            <Status>
              <Label>Collateral ratio (CR): </Label>
              {`${pricedCR}`}
            </Status>
            <Status>
              <Label>Liquidation price: </Label>
              {`${liquidationPrice} (${priceIdUtf8})`}
            </Status>
            <Status>
              <Label>Pending withdrawal request: </Label>
              {`${_pendingWithdraw}`}
            </Status>
            <Status>
              <Label>Requested withdrawal amount: </Label>
              {`${_withdrawAmt}`}
            </Status>
          </Grid>
          <Grid item md={6} xs={12}>
            <Typography variant="h5">Contract Info</Typography>
            <Status>
              <Label>Identifier price: </Label>
              {_latestPrice}
            </Status>

            <Status>
              <Label>Global collateral ratio (GCR): </Label>
              {`${pricedGCR}`}
            </Status>
            <Status>
              <Label>Collateral requirement: </Label>
              {`${collReqFromWei}`}
            </Status>
          </Grid>
        </Grid>
      </Container>
    );
  }
};

export default YourPosition;
