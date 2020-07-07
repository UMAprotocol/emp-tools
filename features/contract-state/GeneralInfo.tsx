import styled from "styled-components";
import { ethers, BigNumberish } from "ethers";
import { Typography, Box, Tooltip } from "@material-ui/core";

import EmpState from "../../containers/EmpState";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import EmpContract from "../../containers/EmpContract";
import Totals from "../../containers/Totals";

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

  const {
    expirationTimestamp: expiry,
    priceIdentifier: priceId,
    collateralRequirement: collReq,
    minSponsorTokens,
  } = empState;
  const { symbol: collSymbol } = Collateral.useContainer();
  const { symbol: tokenSymbol } = Token.useContainer();

  // format nice date
  const expiryDate = expiry ? new Date(expiry.toNumber() * 1000) : "N/A";

  return (
    <Box>
      <Typography variant="h5">
        General Info{" "}
        {contract && (
          <Link
            href={`https://etherscan.io/address/${contract.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            etherscan
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
          <span>{gcr ? gcr : "N/A"}</span>
        </Tooltip>
      </Status>
    </Box>
  );
};

export default GeneralInfo;
