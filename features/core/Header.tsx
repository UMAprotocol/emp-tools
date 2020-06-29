import dynamic from "next/dynamic";
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";

import Connection from "../../containers/Connection";

// Jazzicon library does some stuff that breaks SSR, so we disable it here
const Identicon = dynamic(() => import("./Identicon"), {
  ssr: false,
});

interface IProps {
  styled: {
    connected: boolean;
  };
}

const ConnectButton = styled(Button)`
  pointer-events: ${({ styled }: IProps) =>
    styled.connected ? "none" : "unset"};
  ${({ styled }: IProps) => styled.connected && "background-color: #303030;"}
`;

const AddressBox = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.23);
  align-self: stretch;
  border-right: none;
  margin-right: -2px;
  padding-right: 14px;
  padding-left: 12px;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;

  display: flex;
  align-items: center;

  background: #252525;
`;

const Header = () => {
  const { connect, signer, network, address } = Connection.useContainer();
  const connected = signer !== null;

  const networkName = network?.name === "homestead" ? "mainnet" : network?.name;
  const shortAddress = `${address?.substr(0, 5)}…${address?.substr(-4)}`;

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="h4">
          <i>EMP Tools</i>
        </Typography>
      </Box>
      <Box display="flex" alignItems="center">
        {address && (
          <AddressBox title={address || undefined}>
            <Identicon address={address} />
            &nbsp;
            <div>{shortAddress}</div>
          </AddressBox>
        )}
        {connected ? (
          <ConnectButton variant="outlined" styled={{ connected }}>
            <span style={{ color: "#8bc34a" }}>●</span>&nbsp;
            {networkName}
          </ConnectButton>
        ) : (
          <ConnectButton
            variant="contained"
            onClick={connect}
            styled={{ connected }}
          >
            🦊 Connect
          </ConnectButton>
        )}
      </Box>
    </Box>
  );
};

export default Header;
