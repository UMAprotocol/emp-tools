import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Connection from "../../containers/Connection";

const TitleContainer = styled(Box)`
  display: flex;
`;

interface IProps {
  pointerEvents: string;
}

const ConnectButton = styled(Button)`
  height: fit-content;
  align-self: center;
  pointer-events: ${(p: IProps) => p.pointerEvents};
  margin-right: 16px;
`;

const ErrorMsg = styled(Typography)`
  align-self: center;
  color: red;
`;

const Header = () => {
  const { connect, signer, error } = Connection.useContainer();
  const connected = signer !== null;
  return (
    <>
      <Typography variant="h4">
        <TitleContainer mb={2}>
          <Box fontStyle="italic" mr={2}>
            EMP Tools
          </Box>
          <ConnectButton
            variant={connected ? "outlined" : "contained"}
            onClick={connect}
            pointerEvents={connected ? "none" : "unset"}
          >
            {connected ? "🦊 Connected" : "🦊 Connect"}
          </ConnectButton>
          <ErrorMsg>{error && error.message}</ErrorMsg>
        </TitleContainer>
      </Typography>
    </>
  );
};

export default Header;
