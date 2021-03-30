import styled from "styled-components";
import { utils } from "ethers";
import { Typography, Box, Tooltip } from "@material-ui/core";

import AddressUtils from "../../core/AddressUtils";

import EmpState from "../../../containers/EmpState";
import Token from "../../../containers/Token";
import EmpContract from "../../../containers/EmpContract";
import EmpSponsors from "../../../containers/EmpSponsors";
import PriceFeed from "../../../containers/PriceFeed";
import Etherscan from "../../../containers/Etherscan";

import { DOCS_MAP } from "../../../constants/docLinks";

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
const parseBytes32String = utils.parseBytes32String;

const defaultMissingDataDisplay = "N/A";

type GeneralInfoViewType = {
  expiryTimestamp: string;
  expiryDate: string;
  prettyLatestPrice: string;
  pricedGcr: string;
  priceIdUtf8: string;
  collReqPct: string;
  minSponsorTokensSymbol: string;
  isExpired: string;
  sourceUrls: string[];
  sponsorCount: string;
};
function GeneralInfoView({
  expiryTimestamp = defaultMissingDataDisplay,
  expiryDate = defaultMissingDataDisplay,
  prettyLatestPrice = defaultMissingDataDisplay,
  pricedGcr = defaultMissingDataDisplay,
  priceIdUtf8 = defaultMissingDataDisplay,
  collReqPct = defaultMissingDataDisplay,
  minSponsorTokensSymbol = defaultMissingDataDisplay,
  isExpired = defaultMissingDataDisplay,
  sourceUrls = [],
  sponsorCount = defaultMissingDataDisplay,
}: GeneralInfoViewType) {
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
        {priceIdUtf8}
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

// TODO: price feed will need to be updated to use uniswap and also be able to calculate funding rate
const GeneralInfo = () => {
  return GeneralInfoView({
    expiryTimestamp: defaultMissingDataDisplay,
    expiryDate: defaultMissingDataDisplay,
    prettyLatestPrice: defaultMissingDataDisplay,
    pricedGcr: defaultMissingDataDisplay,
    priceIdUtf8: defaultMissingDataDisplay,
    collReqPct: defaultMissingDataDisplay,
    minSponsorTokensSymbol: defaultMissingDataDisplay,
    isExpired: defaultMissingDataDisplay,
    sourceUrls: [],
    sponsorCount: defaultMissingDataDisplay,
  });
};

export default GeneralInfo;
