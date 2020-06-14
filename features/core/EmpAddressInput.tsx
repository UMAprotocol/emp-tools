import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import EmpAddress from "../../containers/EmpAddress";

const EmpAddressInput = () => {
  const { empAddress, setEmpAddress, isValid } = EmpAddress.useContainer();

  const handleChange = (e: {
    target: HTMLInputElement | HTMLTextAreaElement;
  }) => setEmpAddress(e.target.value);

  // const getHelperText = () => {
  //   if (!isValid) return "Please enter a valid address"
  //   if (loading) return "Loading..."
  //   return null
  // }

  return (
    <Box py={2}>
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
    </Box>
  );
};

export default EmpAddressInput;
