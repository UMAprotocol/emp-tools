import { useState, useEffect } from "react";

import { Box, Button } from "@material-ui/core";
import useEmpList from "./useEmpList";
import Connection from "../../containers/Connection";
import EmpListDialog from "./EmpListDialog";

const EmpList = () => {
  const { signer } = Connection.useContainer();
  const [dialogOpen, setDialogOpen] = useState(false);
  const closeDialog = () => setDialogOpen(false);
  const openDialog = () => setDialogOpen(true);
  const { emps, getEmps } = useEmpList();

  // fetch every time we open the dialog
  useEffect(() => {
    if (dialogOpen === true) getEmps();
  }, [dialogOpen]);

  return (
    <Box pt={3}>
      <Button
        variant="contained"
        color="primary"
        onClick={openDialog}
        disabled={!signer}
      >
        {signer ? "Select an EMP" : "Please connect to select an EMP"}
      </Button>

      <EmpListDialog
        dialogOpen={dialogOpen}
        closeDialog={closeDialog}
        emps={emps}
      />
    </Box>
  );
};

export default EmpList;
