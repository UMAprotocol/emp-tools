import styled from "styled-components";
import { utils } from "ethers";
import { Typography, Box, Tooltip } from "@material-ui/core";

import AddressUtils from "../../core/AddressUtils";

import EmpSponsors from "../../../containers/EmpSponsors";
import Token from "../../../containers/Token";
import ContractState from "../../../containers/ContractState";
import PriceFeed from "../../../containers/PriceFeed";
import Etherscan from "../../../containers/Etherscan";
import Totals from "../../../containers/Totals";

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
  prettyLatestPrice: string;
  pricedGcr: string;
  priceIdUtf8: string;
  collReqPct: string;
  minSponsorTokensSymbol: string;
  sourceUrls: string[];
  sponsorCount: string;
};
function GeneralInfoView({
  prettyLatestPrice = defaultMissingDataDisplay,
  pricedGcr = defaultMissingDataDisplay,
  priceIdUtf8 = defaultMissingDataDisplay,
  collReqPct = defaultMissingDataDisplay,
  minSponsorTokensSymbol = defaultMissingDataDisplay,
  sourceUrls = [],
  sponsorCount = defaultMissingDataDisplay,
}: GeneralInfoViewType) {
  return (
    <Box>
      <Typography variant="h5">{`General Info `}</Typography>
      <AddressUtils />

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

const GeneralInfo = () => {
  const { latestPrice, sourceUrls = [] } = PriceFeed.useContainer();
  const { loading, error, data } = ContractState.useContainer();
  const { activeSponsors = [] } = EmpSponsors.useContainer();
  const { symbol: tokenSymbol, decimals: tokenDecimals } = Token.useContainer();
  const { gcr } = Totals.useContainer();

  if (
    loading ||
    error ||
    !gcr ||
    !tokenSymbol ||
    !tokenDecimals ||
    latestPrice === null
  ) {
    return GeneralInfoView({
      prettyLatestPrice: defaultMissingDataDisplay,
      pricedGcr: defaultMissingDataDisplay,
      priceIdUtf8: defaultMissingDataDisplay,
      collReqPct: defaultMissingDataDisplay,
      minSponsorTokensSymbol: defaultMissingDataDisplay,
      sourceUrls: [],
      sponsorCount: defaultMissingDataDisplay,
    });
  }

  const {
    priceIdentifier,
    collateralRequirement,
    minSponsorTokens,
    isExpired,
  } = data;

  const prettyLatestPrice = Number(latestPrice).toFixed(8);
  const pricedGcr = (gcr / latestPrice).toFixed(8);

  const priceIdUtf8 = parseBytes32String(priceIdentifier);
  const collReqPct = parseFloat(fromWei(collateralRequirement)).toString();
  const minSponsorTokensSymbol = `${fromWei(
    minSponsorTokens,
    tokenDecimals
  )} ${tokenSymbol}`;

  const sponsorCount = Object.keys(activeSponsors).length.toString();

  return GeneralInfoView({
    prettyLatestPrice,
    pricedGcr,
    priceIdUtf8,
    collReqPct,
    minSponsorTokensSymbol,
    sourceUrls,
    sponsorCount,
  });
};

export default GeneralInfo;
