import styled from "styled-components";
import { ethers, BigNumberish } from "ethers";
import { Typography, Box, Tooltip } from "@material-ui/core";

import EmpState from "../../containers/EmpState";

const Label = styled.span`
  color: #999999;
`;

const Status = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const fromWei = ethers.utils.formatUnits;
const weiToNum = (x: BigNumberish) => parseFloat(fromWei(x));

const GeneralInfo = () => {
  const { empState } = EmpState.useContainer();
  const {
    expirationTimestamp: expiry,
    priceIdentifier: priceId,
    collateralRequirement: collReq,
    minSponsorTokens,
    cumulativeFeeMultiplier: multiplier,
    rawTotalPositionCollateral: rawColl,
    totalTokensOutstanding: totalTokensWei,
  } = empState;

  // do some calc
  const totalColl =
    multiplier && rawColl ? weiToNum(multiplier) * weiToNum(rawColl) : null;
  const totalTokens = totalTokensWei ? weiToNum(totalTokensWei) : null;
  const gcr = totalColl && totalTokens ? totalColl / totalTokens : null;

  // format nice date
  const expiryDate = expiry ? new Date(expiry.toNumber() * 1000) : "N/A";

  return (
    <Box>
      <Typography variant="h5">General Info</Typography>
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
        {minSponsorTokens ? fromWei(minSponsorTokens) : "N/A"}
      </Status>

      <Status>
        <Label>Total Collateral: </Label>
        {totalColl ? totalColl : "N/A"}
      </Status>

      <Status>
        <Label>Total Tokens: </Label>
        {totalTokens ? totalTokens : "N/A"}
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
