import styled from "styled-components";
import { Typography, Box } from "@material-ui/core";

import Token from "../../containers/Token";

const Label = styled.span`
  color: #999999;
`;

const Status = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TokenInfo = () => {
  const { name, symbol, decimals, balance, address } = Token.useContainer();
  return (
    <Box pt={3}>
      {symbol ? (
        <Typography variant="h5">Token ({symbol})</Typography>
      ) : (
        <Typography variant="h5">Token</Typography>
      )}
      <Status>
        <Label>Address: </Label>
        {address || "N/A"}
      </Status>

      <Status>
        <Label>Name: </Label>
        {name || "N/A"}
      </Status>

      <Status>
        <Label>Decimals: </Label>
        {decimals || "N/A"}
      </Status>

      <Status>
        <Label>Wallet balance: </Label>
        {balance ? `${balance} ${symbol}` : "N/A"}
      </Status>
    </Box>
  );
};

export default TokenInfo;
