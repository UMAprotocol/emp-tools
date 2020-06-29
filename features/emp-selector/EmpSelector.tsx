import styled from "styled-components";
import Box from "@material-ui/core/Box";
import { withStyles } from "@material-ui/core/styles";

import InputBase from "@material-ui/core/InputBase";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import ListItemText from "@material-ui/core/ListItemText";
import useEmpList from "./useEmpList";
import EmpAddress from "../../containers/EmpAddress";
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
  const { signer } = Connection.useContainer();
  const { empAddress, setEmpAddress } = EmpAddress.useContainer();
  const { emps, loading } = useEmpList();

  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value;
    setEmpAddress(value === 0 ? null : (value as string));
  };

  const noEmpsOrLoading = emps.length < 1 || loading;
  return (
    <Box py={2}>
      <FormWrapper>
        <Select
          value={noEmpsOrLoading || empAddress === null ? 0 : empAddress}
          onChange={handleChange}
          input={<BootstrapInput />}
          disabled={noEmpsOrLoading}
        >
          {!signer ? (
            <MenuItem value={0}>
              <ListItemText
                primary="Not connected"
                secondary="You must connect to MetaMask before selecting an EMP"
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
                <ListItemText primary={emp.name} secondary={emp.address} />
              </MenuItem>
            );
          })}
        </Select>
      </FormWrapper>
    </Box>
  );
};

export default EmpSelector;
