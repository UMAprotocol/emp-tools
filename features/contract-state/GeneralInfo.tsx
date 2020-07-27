import styled from "styled-components";
import { utils } from "ethers";
import { Typography, Box, Tooltip } from "@material-ui/core";

import EmpState from "../../containers/EmpState";
import Token from "../../containers/Token";
import EmpContract from "../../containers/EmpContract";
import Totals from "../../containers/Totals";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";

import { DOCS_MAP } from "../../utils/getDocLinks";

const Label = styled.span`
  color: #999999;
`;

const Status = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const fromWei = utils.formatUnits;
const parseBytes32String = utils.parseBytes32String;

const GeneralInfo = () => {
  const { contract } = EmpContract.useContainer();
  const { empState } = EmpState.useContainer();
  const { gcr } = Totals.useContainer();
  const { latestPrice, sourceUrl } = PriceFeed.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();
  const {
    expirationTimestamp: expiry,
    priceIdentifier: priceId,
    collateralRequirement: collReq,
    minSponsorTokens,
    withdrawalLiveness,
  } = empState;
  const { symbol: tokenSymbol } = Token.useContainer();
  const defaultMissingDataDisplay = "N/A";

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
    const withdrawalLivenessInMinutes = (
      Number(withdrawalLiveness) / 60
    ).toFixed(2);
    const priceIdUtf8 = parseBytes32String(priceId);
    const collReqPct = (parseFloat(fromWei(collReq)) * 100).toString();
    const minSponsorTokensSymbol = `${fromWei(
      minSponsorTokens
    )} ${tokenSymbol}`;

    return renderComponent(
      expiryTimestamp,
      expiryDate,
      prettyLatestPrice,
      pricedGcr,
      withdrawalLivenessInMinutes,
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
    withdrawalLivenessInMinutes: string = defaultMissingDataDisplay,
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
          <Label>Expiry Date: </Label>
          <Tooltip title={`Timestamp: ${expiryTimestamp}`} interactive>
            <span>{expiryDate} UTC</span>
          </Tooltip>
        </Status>

        <Status>
          <Label>Price Identifier: </Label>
          {priceIdUtf8}
        </Status>

        <Status>
          <Label>
            Identifier Price: (
            <Link href={sourceUrl} target="_blank" rel="noopener noreferrer">
              Coinbase
            </Link>
            )
          </Label>
          {`: ${prettyLatestPrice}`}
        </Status>

        <Status>
          <Label>Collateral Requirement: </Label>
          {collReqPct}
        </Status>

        <Status>
          <Label>Minimum Sponsor Tokens: </Label>
          {minSponsorTokensSymbol}
        </Status>

        <Status>
          <Label>Global Collateral ratio: </Label>
          <Tooltip
            title={`The Global Collateralization Ratio (GCR) is the ratio of the total amount of collateral to total number of outstanding tokens.`}
          >
            <span>{pricedGcr}</span>
          </Tooltip>
        </Status>

        <Status>
          <Label>
            Withdraw Liveness (mins) (
            <Link
              href={DOCS_MAP.SLOW_WITHDRAW}
              target="_blank"
              rel="noopener noreferrer"
            >
              Docs
            </Link>
            ){`: `}
          </Label>
          <Tooltip
            title={`To withdraw past the global collateralization ratio, you will need to wait a liveness period before completing your withdrawal.`}
          >
            <span>{withdrawalLivenessInMinutes}</span>
          </Tooltip>
        </Status>
      </Box>
    );
  }
};

export default GeneralInfo;
