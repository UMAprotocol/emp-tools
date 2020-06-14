import styled from "styled-components";
import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";

import EmpAddress from "../../containers/EmpAddress";
import { Emp } from "./useEmpList";

const CloseButton = styled(ListItemText)`
  text-align: center;
  width: 100%;
  text-transform: uppercase;
`;

interface IProps {
  closeDialog: () => void;
  dialogOpen: boolean;
  emps: Emp[] | null;
}

const EmpListDialog = ({ closeDialog, dialogOpen, emps }: IProps) => {
  const { setEmpAddress } = EmpAddress.useContainer();

  // render null-state
  if (emps === null) {
    return (
      <Dialog
        onClose={closeDialog}
        aria-labelledby="simple-dialog-title"
        open={dialogOpen}
      >
        <DialogTitle id="simple-dialog-title">
          Loading EMP contracts...
        </DialogTitle>
        <ListItem autoFocus button onClick={closeDialog}>
          <CloseButton>Cancel</CloseButton>
        </ListItem>
      </Dialog>
    );
  }

  return (
    <Dialog
      onClose={closeDialog}
      aria-labelledby="simple-dialog-title"
      open={dialogOpen}
    >
      <DialogTitle id="simple-dialog-title">
        Select an EMP contract ({emps.length})
      </DialogTitle>
      <List>
        {emps.map((emp) => (
          <ListItem
            button
            key={emp.address}
            onClick={() => {
              setEmpAddress(emp.address);
              closeDialog();
            }}
          >
            <ListItemText primary={emp.name} secondary={emp.address} />
          </ListItem>
        ))}
        {emps.length === 0 && (
          <ListItem>
            <div style={{ textAlign: "center", width: "100%" }}>
              No EMPs Found
            </div>
          </ListItem>
        )}
        <ListItem autoFocus button onClick={closeDialog}>
          <CloseButton>Cancel</CloseButton>
        </ListItem>
      </List>
    </Dialog>
  );
};

export default EmpListDialog;
