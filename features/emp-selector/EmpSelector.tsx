import styled from "styled-components";
import { useState } from "react";
import {
  Box,
  useMediaQuery,
  InputBase,
  MenuItem,
  FormControl,
  ListItemText,
  Select,
  Button,
  IconButton,
  Snackbar,
} from "@material-ui/core";
import { withStyles, useTheme } from "@material-ui/core/styles";
import LaunchIcon from "@material-ui/icons/Launch";
import CopyIcon from "@material-ui/icons/FileCopy";
import MuiAlert from "@material-ui/lab/Alert";

import useEmpList from "./useEmpList";
import EmpAddress from "../../containers/EmpAddress";
import Etherscan from "../../containers/Etherscan";
import Connection from "../../containers/Connection";

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

const EmpSelector = () => {
  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const { getEtherscanUrl } = Etherscan.useContainer();
  const { signer } = Connection.useContainer();
  const { empAddress, setEmpAddress } = EmpAddress.useContainer();
  const { emps, loading } = useEmpList();
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value;
    setEmpAddress(value === 0 ? null : (value as string));
  };

  const prettyAddress = (x: string) => {
    return x.substr(0, 6) + "..." + x.substr(x.length - 6, x.length);
  };

  const etherscanLink = getEtherscanUrl(empAddress) || "/";
  const handleCloseSnackbar = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    setCopySuccess(false);
  };
  const copyStringToClipboard = (str: string) => {
    setCopySuccess(false);

    // Source for implementation details: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    if (!navigator.clipboard) {
      // Synchronously copy
      const textArea = document.createElement("textarea");
      textArea.value = str;

      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        const msg = successful ? "successful" : "unsuccessful";
        setCopySuccess(true);
      } catch (err) {
        console.error("Sync: Could not copy text: ", err);
      }

      document.body.removeChild(textArea);
    } else {
      // Asynchronously copy. This has been the way to copy to the clipboard for Chrome since v66.
      navigator.clipboard.writeText(str).then(
        function () {
          setCopySuccess(true);
        },
        function (err) {
          console.error("Async: Could not copy text: ", err);
        }
      );
    }
  };

  const noEmpsOrLoading = emps.length < 1 || loading;
  return (
    <Box py={2}>
      {empAddress && (
        <>
          <IconButton
            size="small"
            onClick={() => copyStringToClipboard(empAddress)}
          >
            <CopyIcon fontSize="inherit" />
          </IconButton>
          <Button
            href={etherscanLink}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<LaunchIcon />}
          >
            View on Etherscan
          </Button>
        </>
      )}
      <FormWrapper>
        <Select
          style={{ marginTop: "8px" }}
          value={noEmpsOrLoading || empAddress === null ? 0 : empAddress}
          onChange={handleChange}
          input={<BootstrapInput />}
          disabled={noEmpsOrLoading}
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
                primary={loading ? "Please wait" : "Select an EMP"}
                secondary={
                  loading
                    ? "Loading list of EMPs..."
                    : `${emps.length} EMPs found`
                }
              />
            </MenuItem>
          )}
          {emps.map((emp) => {
            return (
              <MenuItem value={emp.address} key={emp.address}>
                <ListItemText
                  primary={largeScreen ? emp.name : emp.symbol}
                  secondary={
                    largeScreen ? emp.address : prettyAddress(emp.address)
                  }
                />
              </MenuItem>
            );
          })}
        </Select>
      </FormWrapper>
      <Snackbar
        style={{ color: "green" }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert severity="success">Copied Address</MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default EmpSelector;
