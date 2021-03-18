import styled from "styled-components";
import {
  Box,
  useMediaQuery,
  InputBase,
  MenuItem,
  FormControl,
  ListItemText,
  Select,
} from "@material-ui/core";
import { withStyles, useTheme } from "@material-ui/core/styles";

import ContractList from "../../containers/ContractList";
import SelectedContract from "../../containers/SelectedContract";
import Connection from "../../containers/Connection";
import Uniswap from "../../containers/Uniswap";

const BootstrapInput = withStyles((theme) => ({
  root: {
    position: "relative",
    transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
    backgroundColor: "rgba(255, 255, 255, 0.09)",
    width: `100%`,
  },
  input: {
    display: "flex",
    paddingLeft: "16px",
    alignItems: "center",
  },
}))(InputBase);

const FormWrapper = styled(FormControl)`
  width: 100%;
  & .MuiSelect-icon {
    right: 12px;
  }
`;

const ContractSelector = () => {
  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up("sm"));

  const { signer } = Connection.useContainer();
  const { address, setAddress } = SelectedContract.useContainer();
  const { contracts, loading } = ContractList.useContainer();
  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value;
    setAddress(value === 0 ? null : (value as string));
  };

  const prettyAddress = (x: string) => {
    return x.substr(0, 6) + "..." + x.substr(x.length - 6, x.length);
  };

  const noContractsOrLoading = contracts.length < 1 || loading;

  return (
    <Box py={2}>
      <FormWrapper>
        <Select
          value={noContractsOrLoading || address === null ? 0 : address}
          onChange={handleChange}
          input={<BootstrapInput />}
          disabled={noContractsOrLoading}
        >
          {!signer ? (
            <MenuItem value={0}>
              <ListItemText
                primary="Not connected"
                secondary="You must connect your wallet first"
              />
            </MenuItem>
          ) : (
            <MenuItem value={0}>
              <ListItemText
                primary={loading ? "Please wait" : "Select an UMA Contract"}
                secondary={
                  loading
                    ? "Loading list of UMA Contracts..."
                    : `${contracts.length} Contracts found`
                }
              />
            </MenuItem>
          )}
          {contracts.map((contract) => {
            return (
              <MenuItem value={contract.address} key={contract.address}>
                <ListItemText
                  primary={
                    largeScreen
                      ? `(${contract.type}) ${contract.name}`
                      : `(${contract.type}) ${contract.symbol}`
                  }
                  secondary={
                    largeScreen
                      ? contract.address
                      : prettyAddress(contract.address)
                  }
                />
              </MenuItem>
            );
          })}
        </Select>
      </FormWrapper>
    </Box>
  );
};

export default ContractSelector;
