import styled from "styled-components";
import { utils } from "ethers";
import { Typography, Box, Tooltip } from "@material-ui/core";

import AddressUtils from "../core/AddressUtils";

import EmpState from "../../containers/EmpState";
import Token from "../../containers/Token";
import EmpSponsors from "../../containers/EmpSponsors";
import Totals from "../../containers/Totals";
import PriceFeed from "../../containers/PriceFeed";

import { DOCS_MAP } from "../../constants/docLinks";

const Label = styled.span`
  color: #999999;
`;

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const Status = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const fromWei = utils.formatUnits;

const GeneralInfo = () => {
  const { empState, loading } = EmpState.useContainer();
  const { activeSponsors } = EmpSponsors.useContainer();
  const { gcr } = Totals.useContainer();
  const { latestPrice, sourceUrls } = PriceFeed.useContainer();
  const {
    expirationTimestamp: expiry,
    priceIdentifierUtf8,
    collateralRequirement: collReq,
    minSponsorTokens,
    isExpired,
  } = empState;
  const { symbol: tokenSymbol, decimals: tokenDecimals } = Token.useContainer();

  const defaultMissingDataDisplay = "N/A";
  /*   console.log("---------------------------------");
  console.log("active sponsors: ", activeSponsors);
  console.log("expiry: ", expiry);
  console.log("gcr: ", gcr);
  console.log("latestPrice: ", latestPrice);
  console.log("priceIdentifierUtf8: ", priceIdentifierUtf8);
  console.log("collReq: ", collReq);
  console.log("minSponsorTokens: ", minSponsorTokens);
  console.log("tokenSymbol: ", tokenSymbol);
  console.log("isExpired: ", isExpired);
  console.log("sourceUrls: ", sourceUrls);
  console.log("tokenDecimals: ", tokenDecimals);
  console.log("---------------------------------"); */

  if (
    !loading &&
    activeSponsors !== null &&
    expiry !== null &&
    gcr !== null &&
    latestPrice !== null &&
    priceIdentifierUtf8 !== null &&
    collReq !== null &&
    minSponsorTokens !== null &&
    tokenSymbol !== null &&
    isExpired !== null &&
    sourceUrls !== undefined &&
    tokenDecimals !== null
  ) {
    const expiryTimestamp = expiry.toString();
    const expiryDate = new Date(
      expiry.toNumber() * 1000
    ).toLocaleString("en-GB", { timeZone: "UTC" });
    const prettyLatestPrice = Number(latestPrice).toFixed(8);
    const pricedGcr = (gcr / latestPrice).toFixed(8);

    const collReqPct = parseFloat(fromWei(collReq)).toString();
    const minSponsorTokensSymbol = `${fromWei(
      minSponsorTokens,
      tokenDecimals
    )} ${tokenSymbol}`;

    const sponsorCount = Object.keys(activeSponsors).length.toString();
    return renderComponent(
      expiryTimestamp,
      expiryDate,
      prettyLatestPrice,
      pricedGcr,
      priceIdentifierUtf8,
      collReqPct,
      minSponsorTokensSymbol,
      isExpired ? "YES" : "NO",
      sourceUrls,
      sponsorCount
    );
  } else {
    return renderComponent();
  }

  function renderComponent(
    expiryTimestamp: string = defaultMissingDataDisplay,
    expiryDate: string = defaultMissingDataDisplay,
    prettyLatestPrice: string = defaultMissingDataDisplay,
    pricedGcr: string = defaultMissingDataDisplay,
    priceIdentifierUtf8: string = defaultMissingDataDisplay,
    collReqPct: string = defaultMissingDataDisplay,
    minSponsorTokensSymbol: string = defaultMissingDataDisplay,
    isExpired: string = defaultMissingDataDisplay,
    sourceUrls: string[] = [],
    sponsorCount: string = defaultMissingDataDisplay
  ) {
    return (
      <Box>
        <Typography variant="h5">{`General Info `}</Typography>
        <AddressUtils />

        <Status>
          <Label>Expiry date: </Label>
          <Tooltip title={`Timestamp: ${expiryTimestamp}`} interactive>
            <span>{expiryDate} UTC</span>
          </Tooltip>
        </Status>

        <Status>
          <Label>
            Is expired (
            <Link
              href={DOCS_MAP.EXPIRY_SETTLEMENT}
              target="_blank"
              rel="noopener noreferrer"
            >
              Docs
            </Link>
            ){`: `}
          </Label>
          {isExpired}
        </Status>

        <Status>
          <Label>Price identifier: </Label>
          {priceIdentifierUtf8}
        </Status>

        <Status>
          <Label>Identifier price: </Label>
          {`${prettyLatestPrice}`}
        </Status>

        <Status>
          <Label>Identifier sources: </Label>
          {sourceUrls.map((url: string, index: number) => {
            return (
              <Link
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {(index === 0 ? " [" : "") +
                  ((url.includes("coinbase") && "Coinbase") ||
                    (url.includes("kraken") && "Kraken") ||
                    (url.includes("binance") && "Binance") ||
                    (url.includes("bitstamp") && "Bitstamp") ||
                    "") +
                  (index < sourceUrls.length - 1 ? ", " : "]")}
              </Link>
            );
          })}
        </Status>
        <Status>
          <Label>Global collateral ratio: </Label>
          <Tooltip
            title={`The Global Collateralization Ratio (GCR) is the ratio of the total amount of collateral to total number of outstanding tokens.`}
          >
            <span>{pricedGcr}</span>
          </Tooltip>
        </Status>
        <Status>
          <Label>Collateral requirement: </Label>
          {collReqPct}
        </Status>
        <Status>
          <Label>Unique sponsors: </Label>
          {sponsorCount}
        </Status>
        <Status>
          <Label>Minimum sponsor tokens: </Label>
          {minSponsorTokensSymbol}
        </Status>
      </Box>
    );
  }
};

export default GeneralInfo;
