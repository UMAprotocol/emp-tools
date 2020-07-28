import styled from "styled-components";
import { ethers } from "ethers";
import { Typography, Box, Tooltip } from "@material-ui/core";

import EmpState from "../../containers/EmpState";

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

const DisputeParams = () => {
  const { empState } = EmpState.useContainer();

  const {
    disputeBondPct,
    disputerDisputeRewardPct,
    sponsorDisputeRewardPct,
    withdrawalLiveness,
  } = empState;
  const withdrawalLivenessInMinutes = (Number(withdrawalLiveness) / 60).toFixed(
    2
  );

  return (
    <Box>
      <Typography variant="h5">Dispute Params</Typography>
      <Status>
        <Label>Dispute bond: </Label>
        {disputeBondPct
          ? `${parseFloat(fromWei(disputeBondPct)) * 100}%`
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
          Withdraw liveness (mins) (
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
};

export default DisputeParams;
