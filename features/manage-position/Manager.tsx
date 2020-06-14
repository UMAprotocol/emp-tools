import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { useState, useEffect } from "react";

import MethodSelector from "./MethodSelector";
import Create from "./Create";

export type Method = "create" | "deposit" | "withdraw" | "redeem" | "transfer";

const Manager = () => {
  const [method, setMethod] = useState<Method>("create");
  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) =>
    setMethod(e.target.value as Method);

  return (
    <Box my={4}>
      <Typography variant="h5">Manage Position</Typography>
      <MethodSelector method={method} handleChange={handleChange} />

      {method === "create" && <Create />}
    </Box>
  );
};

export default Manager;
