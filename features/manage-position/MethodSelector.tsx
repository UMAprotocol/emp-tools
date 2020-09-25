import styled from "styled-components";
import Box from "@material-ui/core/Box";
import { withStyles } from "@material-ui/core/styles";

import InputBase from "@material-ui/core/InputBase";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import ListItemText from "@material-ui/core/ListItemText";
import { Method } from "./ManagePosition";

import EmpState from "../../containers/EmpState";
import EmpAddress from "../../containers/EmpAddress";
import Connection from "../../containers/Connection";

import { legacyEMPs } from "../../constants/legacyEmps";

const BootstrapInput = withStyles((theme) => ({
  root: {
    "label + &": {
      marginTop: theme.spacing(3),
    },
    position: "relative",
    transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
    backgroundColor: "rgba(255, 255, 255, 0.09)",
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
    maxWidth: `500px`,
  },
  input: {
    display: "flex",
    paddingLeft: "16px",
    alignItems: "center",
  },
}))(InputBase);

const FormWrapper = styled(FormControl)`
  width: 100%;
`;

interface IProps {
  method: Method;
  handleChange: (e: React.ChangeEvent<{ value: unknown }>) => void;
}

const MethodSelector = ({ method, handleChange }: IProps) => {
  const { empState } = EmpState.useContainer();
  const { empAddress } = EmpAddress.useContainer();
  const { network } = Connection.useContainer();
  const { isExpired } = empState;
  if (isExpired !== null) {
    return renderComponent(isExpired);
  } else {
    return renderComponent();
  }

  function renderComponent(contractHasExpired: boolean = false) {
    // Older EMP contracts cannot redeem or cancel withdrawal requests post-expiry.
    const cannotRedeemAndWithdrawPostExpiry =
      network && empAddress && legacyEMPs[network.chainId].includes(empAddress);

    return (
      <Box py={2}>
        <FormWrapper>
          <InputLabel id="demo-simple-select-label">Actions</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            value={method}
            onChange={handleChange}
            input={<BootstrapInput />}
          >
            {contractHasExpired && cannotRedeemAndWithdrawPostExpiry
              ? [
                  <MenuItem key={"settle"} value={"settle"}>
                    <ListItemText
                      primary="Settle"
                      secondary="Settle expired tokens at settlement price."
                    />
                  </MenuItem>,
                ]
              : contractHasExpired
              ? [
                  <MenuItem key={"settle"} value={"settle"}>
                    <ListItemText
                      primary="Settle"
                      secondary="Settle expired tokens at settlement price."
                    />
                  </MenuItem>,
                  <MenuItem key={"withdraw"} value={"withdraw"}>
                    <ListItemText
                      primary="Withdraw"
                      secondary="Cancel pending withdrawal requests"
                    />
                  </MenuItem>,
                  <MenuItem key={"redeem"} value={"redeem"}>
                    <ListItemText
                      primary="Redeem"
                      secondary="Redeem synthetic tokens for locked collateral."
                    />
                  </MenuItem>,
                ]
              : [
                  <MenuItem key={"create"} value={"create"}>
                    <ListItemText
                      primary="Create"
                      secondary="Mint new synthetic tokens."
                    />
                  </MenuItem>,
                  <MenuItem key={"deposit"} value={"deposit"}>
                    <ListItemText
                      primary="Deposit"
                      secondary="Add to position collateral."
                    />
                  </MenuItem>,
                  <MenuItem key={"withdraw"} value={"withdraw"}>
                    <ListItemText
                      primary="Withdraw"
                      secondary="Remove position collateral"
                    />
                  </MenuItem>,
                  <MenuItem key={"redeem"} value={"redeem"}>
                    <ListItemText
                      primary="Redeem"
                      secondary="Redeem synthetics for collateral."
                    />
                  </MenuItem>,
                ]}
          </Select>
        </FormWrapper>
      </Box>
    );
  }
};

export default MethodSelector;
