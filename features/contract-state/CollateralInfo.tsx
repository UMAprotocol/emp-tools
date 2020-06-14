import { useState, useEffect } from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";
import { Typography, Box } from "@material-ui/core";

import EmpState from "../../containers/EmpState";
import Connection from "../../containers/Connection";

const Label = styled.span`
  color: #999999;
`;

const Status = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const fromWei = ethers.utils.formatUnits;

const CollateralInfo = () => {
  const { block$, signer, address } = Connection.useContainer();
  const { empState } = EmpState.useContainer();
  const { collateralCurrency: collAddress } = empState;

  const [symbol, setSymbol] = useState(null);
  const [balance, setBalance] = useState<string | null>(null);

  const getCollateralInfo = async () => {
    if (collAddress && signer) {
      const instance = new ethers.Contract(collAddress, erc20.abi, signer);
      const symbolStr = await instance.symbol();
      const balanceWei = await instance.balanceOf(address);
      setSymbol(symbolStr);
      setBalance(fromWei(balanceWei));
    }
  };

  // get collateral info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getCollateralInfo());
      return () => sub.unsubscribe();
    }
  }, [block$, collAddress, signer]);

  // get collateral info on setting of collateral address
  useEffect(() => {
    if (collAddress) getCollateralInfo();
  }, [collAddress]);

  return (
    <Box pt={3}>
      {symbol ? (
        <Typography variant="h5">Collateral ({symbol})</Typography>
      ) : (
        <Typography variant="h5">Collateral</Typography>
      )}

      <Status>
        <Label>Address: </Label>
        {collAddress || "N/A"}
      </Status>

      <Status>
        <Label>Wallet balance: </Label>
        {balance || "N/A"}
      </Status>
    </Box>
  );
};

export default CollateralInfo;
