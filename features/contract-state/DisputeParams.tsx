import styled from "styled-components";
import { ethers } from "ethers";
import { Typography, Box, Tooltip } from "@material-ui/core";

import EmpState from "../../containers/EmpState";
import OoState from "../../containers/OoState";
import Collateral from "../../containers/Collateral";

import { DOCS_MAP } from "../../constants/docLinks";

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

const DisputeParams = () => {
  const { empState } = EmpState.useContainer();
  const {
    disputeBondPct,
    disputerDisputeRewardPct,
    sponsorDisputeRewardPct,
    withdrawalLiveness,
    liquidationLiveness,
  } = empState;

  const { ooState } = OoState.useContainer();
  const { finalFee } = ooState;
  const { symbol: collSymbol } = Collateral.useContainer();

  const withdrawalLivenessInMinutes = (Number(withdrawalLiveness) / 60).toFixed(
    2
  );
  const liquidationLivenessInMinutes = (
    Number(liquidationLiveness) / 60
  ).toFixed(2);

  return (
    <Box>
      <Typography variant="h5">Dispute Params</Typography>
      <Status>
        <Label>
          Liquidation bond (
          <Link
            href={DOCS_MAP.FINAL_FEE}
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs
          </Link>
          ){`: `}
        </Label>
        {finalFee !== null ? finalFee : "N/A"}{" "}
        {collSymbol !== null ? collSymbol : ""}
      </Status>
      <Status>
        <Label>Dispute bond: </Label>
        {disputeBondPct
          ? `${parseFloat(fromWei(disputeBondPct)) * 100}% + ${
              finalFee !== null ? finalFee : "N/A"
            } ${collSymbol !== null ? collSymbol : ""}`
          : "N/A"}
      </Status>
      <Status>
        <Label>Dispute reward (for sponsor): </Label>
        {sponsorDisputeRewardPct
          ? `${parseFloat(fromWei(sponsorDisputeRewardPct)) * 100}%`
          : "N/A"}
      </Status>
      <Status>
        <Label>Dispute reward (for disputer): </Label>
        {disputerDisputeRewardPct
          ? `${parseFloat(fromWei(disputerDisputeRewardPct)) * 100}%`
          : "N/A"}
      </Status>
      <Status>
        <Label>
          Withdraw liveness in mins (
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
      <Status>
        <Label>
          Liquidation liveness in mins (
          <Link
            href={DOCS_MAP.FINAL_FEE}
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs
          </Link>
          ){`: `}
        </Label>
        <Tooltip
          title={`After a liquidation is submitted the position enters into a liveness period during which the liquidation can be disputed if invalid.`}
        >
          <span>{liquidationLivenessInMinutes}</span>
        </Tooltip>
      </Status>
    </Box>
  );
};

export default DisputeParams;
