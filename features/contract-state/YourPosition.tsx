import styled from "styled-components";
import { Typography, Box } from "@material-ui/core";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

import Connection from "../../containers/Connection";
import Contract from "../../containers/Contract";

const Label = styled.span`
  color: #999999;
`;

const Status = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const fromWei = ethers.utils.formatUnits;

const YourPosition = () => {
  const { block$, signer, address } = Connection.useContainer();
  const { contract } = Contract.useContainer();

  const [collateral, setCollateral] = useState<string | null>(null);
  const [tokens, setTokens] = useState<string | null>(null);
  const [withdrawAmt, setWithdrawAmt] = useState<string | null>(null);
  const [pendingTransfer, setPendingTransfer] = useState<string | null>(null);

  const getPositionInfo = async () => {
    if (address && signer && contract) {
      const collateral = (await contract.getCollateral(address))[0];
      const position = await contract.positions(address);
      const {
        tokensOutstanding,
        withdrawalRequestAmount,
        transferPositionRequestPassTimestamp,
      } = position;
      setCollateral(collateral);
      setTokens(tokensOutstanding[0]);
      setWithdrawAmt(withdrawalRequestAmount[0]);
      setPendingTransfer(
        transferPositionRequestPassTimestamp.toString() !== "0" ? "Yes" : "No"
      );
    }
  };

  // get position info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getPositionInfo());
      return () => sub.unsubscribe();
    }
  }, [block$, address, signer, contract]);

  // get position info on setting of vars
  useEffect(() => {
    getPositionInfo();
  }, [address, signer, contract]);

  return (
    <Box pt={3}>
      <Typography variant="h5">Your Position</Typography>
      <Status>
        <Label>Tokens outstanding: </Label>
        {tokens ? fromWei(tokens) : "N/A"}
      </Status>
      <Status>
        <Label>Collateral supplied: </Label>
        {collateral ? fromWei(collateral) : "N/A"}
      </Status>
      <Status>
        <Label>Collateral pending/available to withdraw: </Label>
        {withdrawAmt ? fromWei(withdrawAmt) : "N/A"}
      </Status>
      <Status>
        <Label>Pending transfer request: </Label>
        {pendingTransfer || "N/A"}
      </Status>
    </Box>
  );
};

export default YourPosition;
