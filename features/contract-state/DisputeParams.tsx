import styled from "styled-components";
import { ethers } from "ethers";
import { Typography, Box, Divider } from "@material-ui/core";

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

const DisputeParams = () => {
  const { empState } = EmpState.useContainer();

  const {
    disputeBondPct,
    disputerDisputeRewardPct,
    sponsorDisputeRewardPct,
  } = empState;

  return (
    <Box pt={3}>
      <Typography variant="h5">Dispute Params</Typography>
      <Status>
        <Label>Dispute Bond: </Label>
        {disputeBondPct
          ? `${parseFloat(fromWei(disputeBondPct)) * 100}%`
          : "N/A"}
      </Status>
      <Status>
        <Label>Dispute Reward (for Sponsor): </Label>
        {sponsorDisputeRewardPct
          ? `${parseFloat(fromWei(sponsorDisputeRewardPct)) * 100}%`
          : "N/A"}
      </Status>
      <Status>
        <Label>Dispute Reward (for Disputer): </Label>
        {disputerDisputeRewardPct
          ? `${parseFloat(fromWei(disputerDisputeRewardPct)) * 100}%`
          : "N/A"}
      </Status>
    </Box>
  );
};

export default DisputeParams;
