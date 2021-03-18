import { Box, Grid, Typography } from "@material-ui/core";
import styled from "styled-components";
import PriceFeed from "../../../containers/PriceFeed";
import EmpState from "../../../containers/EmpState";
import { utils } from "ethers";
const parseBytes32String = utils.parseBytes32String;

const Label = styled.div`
  color: #999999;
`;

const Small = styled.span`
  font-size: 1rem;
`;

const DataBox = styled(Box)`
  border: 1px solid #434343;
  padding: 1rem 1rem;
  margin: 1rem 1rem;
`;

export type PerpetualInfoViewType = {
  fairValue: [string, string];
  marketPrice: [string, string];
  fundingRate: [string, string];
};
export function PerpetualInfoView({
  fairValue,
  marketPrice,
  fundingRate,
}: PerpetualInfoViewType) {
  return (
    <Grid container spacing={0}>
      <Grid item md={4} xs={12}>
        <DataBox>
          <Typography variant="h4">
            <strong>{fairValue[0]}</strong>
            <Small> {fairValue[1]}</Small>
          </Typography>
          <Label>Fair Value</Label>
        </DataBox>
      </Grid>
      <Grid item md={4} xs={12}>
        <DataBox>
          <Typography variant="h4">
            <strong>{marketPrice[0]}</strong>
            <Small> {marketPrice[1]}</Small>
          </Typography>
          <Label>Market Price</Label>
        </DataBox>
      </Grid>
      <Grid item md={4} xs={12}>
        <DataBox>
          <Typography variant="h4">
            <strong>{fundingRate[0]}</strong>
            <Small> {fundingRate[1]}</Small>
          </Typography>
          <Label>Funding Rate</Label>
        </DataBox>
      </Grid>
    </Grid>
  );
}

// TODO: calculate fair market value and funding rate from Uni/Bal/Sushi
export function PerpetualInfo() {
  const { latestPrice } = PriceFeed.useContainer();
  const { empState } = EmpState.useContainer();

  // Show loading when we dont have all our info yet
  if (!empState?.priceIdentifier || !latestPrice) {
    return (
      <PerpetualInfoView
        fairValue={["Loading...", ""]}
        marketPrice={["Loading...", ""]}
        fundingRate={["Loading...", ""]}
      />
    );
  }
  const priceIdentifier = parseBytes32String(empState.priceIdentifier);
  return (
    <PerpetualInfoView
      fairValue={["$123", priceIdentifier]}
      marketPrice={["$" + latestPrice.toFixed(5), priceIdentifier]}
      fundingRate={[".0140%", priceIdentifier]}
    />
  );
}
