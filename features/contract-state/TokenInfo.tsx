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

const TokenInfo = () => {
  const { block$, signer, address } = Connection.useContainer();
  const { empState } = EmpState.useContainer();
  const { tokenCurrency: tokenAddress } = empState;

  const [symbol, setSymbol] = useState(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [name, setName] = useState(null);

  const getTokenInfo = async () => {
    if (tokenAddress && signer) {
      const instance = new ethers.Contract(tokenAddress, erc20.abi, signer);
      const symbolStr = await instance.symbol();
      const balanceWei = await instance.balanceOf(address);
      const nameStr = await instance.name();
      setSymbol(symbolStr);
      setBalance(fromWei(balanceWei));
      setName(nameStr);
    }
  };

  // get collateral info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getTokenInfo());
      return () => sub.unsubscribe();
    }
  }, [block$, tokenAddress, signer]);

  // get collateral info on setting of collateral address
  useEffect(() => {
    if (tokenAddress) getTokenInfo();
  }, [tokenAddress]);

  return (
    <Box pt={3}>
      {symbol ? (
        <Typography variant="h5">Token ({symbol})</Typography>
      ) : (
        <Typography variant="h5">Token</Typography>
      )}
      <Status>
        <Label>Address: </Label>
        {tokenAddress || "N/A"}
      </Status>
      <Status>
        <Label>Name: </Label>
        {name || "N/A"}
      </Status>
      <Status>
        <Label>Wallet balance: </Label>
        {balance || "N/A"}
      </Status>
    </Box>
  );
};

export default TokenInfo;
