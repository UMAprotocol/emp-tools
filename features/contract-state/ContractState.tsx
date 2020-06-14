import styled from "styled-components";
import { ethers } from "ethers";
import { Typography, Box } from "@material-ui/core";

import EmpState from "../../containers/EmpState";
import YourPosition from "./YourPosition";
import DisputeParams from "./DisputeParams";
import CollateralInfo from "./CollateralInfo";
import TokenInfo from "./TokenInfo";

const Label = styled.span`
  color: #999999;
`;

const Status = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const fromWei = ethers.utils.formatUnits;

const ContractState = () => {
  const { empState } = EmpState.useContainer();

  const {
    expirationTimestamp: expiry,
    priceIdentifier: priceId,
    collateralRequirement: collReq,
    minSponsorTokens,
    cumulativeFeeMultiplier,
    rawTotalPositionCollateral,
    totalTokensOutstanding,
  } = empState;

  const getGCR = () => {
    if (
      cumulativeFeeMultiplier &&
      rawTotalPositionCollateral &&
      totalTokensOutstanding
    ) {
      // calc collateral after multipler
      const multiplier = parseFloat(fromWei(cumulativeFeeMultiplier));
      const totalCollateralRaw = parseFloat(
        fromWei(rawTotalPositionCollateral)
      );
      const totalCollateral = totalCollateralRaw * multiplier;

      // div collateral by total outstanding tokens
      const totalTokens = parseFloat(fromWei(totalTokensOutstanding));
      return totalCollateral / totalTokens;
    }
    return null;
  };

  const expiryDate = expiry ? new Date(expiry.toNumber() * 1000) : "N/A";
  return (
    <Box>
      <Box pt={2}>
        <Typography variant="h5">General Params</Typography>
        <Status>
          <Label>Expiry Date: </Label>
          <span title={expiry ? expiry.toString() : undefined}>
            {expiryDate.toString()}
          </span>
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
          <Label>GCR: </Label>
          {getGCR() ? getGCR() : "N/A"}
        </Status>
      </Box>

      <CollateralInfo />

      <TokenInfo />

      <DisputeParams />

      <YourPosition />
    </Box>
  );
};

export default ContractState;
