import { useState } from "react";
import { Box, Button, IconButton, Snackbar } from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import CopyIcon from "@material-ui/icons/FileCopy";
import MuiAlert from "@material-ui/lab/Alert";

import SelectedContract from "../../containers/SelectedContract";
import Etherscan from "../../containers/Etherscan";

const AddressUtils = () => {
  const { getEtherscanUrl } = Etherscan.useContainer();
  const { address, isValid } = SelectedContract.useContainer();
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const etherscanLink = getEtherscanUrl(address) || "/";
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

  return (
    <Box>
      {address && (
        <>
          <IconButton
            size="small"
            onClick={() => copyStringToClipboard(address)}
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

export default AddressUtils;
