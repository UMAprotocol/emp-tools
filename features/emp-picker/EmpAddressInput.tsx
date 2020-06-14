import styled from "styled-components";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import EmpAddress from "../../containers/EmpAddress";

const Container = styled(Box)`
  width: 500px;
`;

const EmpAddressInput = () => {
  const { empAddress, setEmpAddress, isValid } = EmpAddress.useContainer();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEmpAddress(e.target.value);

  return (
    <Container py={2}>
      <TextField
        label="EMP Address"
        placeholder="0x1234567890abcdef..."
        value={empAddress || ""}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        InputProps={{ spellCheck: false }}
        helperText={isValid ? null : "Please enter a valid address"}
        error={!isValid}
        fullWidth
      />
    </Container>
  );
};

export default EmpAddressInput;
