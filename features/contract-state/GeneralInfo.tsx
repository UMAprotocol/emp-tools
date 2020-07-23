import styled from "styled-components";
import { ethers } from "ethers";
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

const fromWei = ethers.utils.formatUnits;

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

  // format nice date
  const expiryDate = expiry ? new Date(expiry.toNumber() * 1000) : "N/A";

  const pricedGcr = gcr && latestPrice ? gcr / Number(latestPrice) : null;

  const withdrawalLivenessInMinutes = withdrawalLiveness
    ? Number(withdrawalLiveness) / 60
    : null;

  return (
    <Box>
      <Typography variant="h5">
        General Info{" "}
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
        {expiry ? (
          <Tooltip title={`Timestamp: ${expiry.toString()}`} interactive>
            <span>{expiryDate.toString()}</span>
          </Tooltip>
        ) : (
          "N/A"
        )}
      </Status>

      <Status>
        <Label>Price Feed Identifier: </Label>
        {priceId ? ethers.utils.parseBytes32String(priceId) : "N/A"}
      </Status>

      <Status>
        <Label>
          Estimated Identifier Price (
          <Link href={sourceUrl} target="_blank" rel="noopener noreferrer">
            Coinbase Pro
          </Link>
          ):{" "}
        </Label>
        {latestPrice ? `${Number(latestPrice).toFixed(4)}` : "N/A"}
      </Status>

      <Status>
        <Label>Collateral Requirement: </Label>
        {collReq ? `${parseFloat(fromWei(collReq)) * 100}%` : "N/A"}
      </Status>

      <Status>
        <Label>Minimum Sponsor Tokens: </Label>
        {minSponsorTokens
          ? `${fromWei(minSponsorTokens)} ${tokenSymbol}`
          : "N/A"}
      </Status>

      <Status>
        <Label>GCR (collateral / tokens): </Label>
        <Tooltip
          title={`The Global Collateralization Ratio (GCR) is the ratio of the total amount of collateral to total number of outstanding tokens.`}
        >
          <span>{pricedGcr ? pricedGcr.toFixed(4) : "N/A"}</span>
        </Tooltip>
      </Status>

      <Status>
        <Label>
          Withdrawal Liveness (minutes) (
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
          <span>
            {withdrawalLiveness
              ? withdrawalLivenessInMinutes?.toFixed(2)
              : "N/A"}
          </span>
        </Tooltip>
      </Status>
    </Box>
  );
};

export default GeneralInfo;
