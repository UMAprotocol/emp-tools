import styled from "styled-components";
import { utils } from "ethers";
import { Typography, Box, Tooltip } from "@material-ui/core";
import { useState, useEffect } from "react";

import EmpState from "../../containers/EmpState";
import Token from "../../containers/Token";
import EmpContract from "../../containers/EmpContract";
import EmpSponsors from "../../containers/EmpSponsors";
import Totals from "../../containers/Totals";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";

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

const GeneralInfo = () => {
  const { contract } = EmpContract.useContainer();
  const { empState } = EmpState.useContainer();
  const { activeSponsors } = EmpSponsors.useContainer();
  const { gcr } = Totals.useContainer();
  const { latestPrice, sourceUrl } = PriceFeed.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();
  const {
    expirationTimestamp: expiry,
    priceIdentifier: priceId,
    collateralRequirement: collReq,
    minSponsorTokens,
  } = empState;
  const { symbol: tokenSymbol } = Token.useContainer();

  const [sponsorCount, setSponsorCount] = useState<string | null>(null);
  const defaultMissingDataDisplay = "N/A";

  useEffect(() => {
    setSponsorCount(Object.keys(activeSponsors).length.toString());
  }, [activeSponsors]);

  if (
    expiry !== null &&
    gcr !== null &&
    latestPrice !== null &&
    priceId !== null &&
    collReq !== null &&
    minSponsorTokens !== null &&
    tokenSymbol !== null
  ) {
    const expiryTimestamp = expiry.toString();
    const expiryDate = new Date(
      expiry.toNumber() * 1000
    ).toLocaleString("en-GB", { timeZone: "UTC" });
    const prettyLatestPrice = Number(latestPrice).toFixed(4);
    const pricedGcr = (gcr / latestPrice).toFixed(4);

    const priceIdUtf8 = parseBytes32String(priceId);
    const collReqPct = parseFloat(fromWei(collReq)).toString();
    const minSponsorTokensSymbol = `${fromWei(
      minSponsorTokens
    )} ${tokenSymbol}`;

    return renderComponent(
      expiryTimestamp,
      expiryDate,
      prettyLatestPrice,
      pricedGcr,
      priceIdUtf8,
      collReqPct,
      minSponsorTokensSymbol
    );
  } else {
    return renderComponent();
  }

  function renderComponent(
    expiryTimestamp: string = defaultMissingDataDisplay,
    expiryDate: string = defaultMissingDataDisplay,
    prettyLatestPrice: string = defaultMissingDataDisplay,
    pricedGcr: string = defaultMissingDataDisplay,
    priceIdUtf8: string = defaultMissingDataDisplay,
    collReqPct: string = defaultMissingDataDisplay,
    minSponsorTokensSymbol: string = defaultMissingDataDisplay
  ) {
    return (
      <Box>
        <Typography variant="h5">
          {`General Info `}
          {contract?.address && (
            <Link
              href={getEtherscanUrl(contract.address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Etherscan
            </Link>
          )}
        </Typography>
        <Status>
          <Label>Expiry date: </Label>
          <Tooltip title={`Timestamp: ${expiryTimestamp}`} interactive>
            <span>{expiryDate} UTC</span>
          </Tooltip>
        </Status>

        <Status>
          <Label>Price identifier: </Label>
          {priceIdUtf8}
        </Status>

        <Status>
          <Label>
            Identifier price: (
            <Link href={sourceUrl} target="_blank" rel="noopener noreferrer">
              Coinbase
            </Link>
            )
          </Label>
          {`: ${prettyLatestPrice}`}
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
