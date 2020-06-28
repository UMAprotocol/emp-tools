import { Box, Divider } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { useState } from "react";

import MethodSelector from "./MethodSelector";
import Create from "./Create";
import YourPosition from "./YourPosition";

export type Method = "create" | "deposit" | "withdraw" | "redeem" | "transfer";

const FalseDoor = () => (
  <Typography>This feature has not been implemented yet.</Typography>
);

const Manager = () => {
  const [method, setMethod] = useState<Method>("create");
  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) =>
    setMethod(e.target.value as Method);

  return (
    <Box my={4}>
      <YourPosition />
      <Divider />
      <Box pt={3}>
        <Typography variant="h5">Manage</Typography>
      </Box>
      <MethodSelector method={method} handleChange={handleChange} />

      {method === "create" && <Create />}
      {method === "deposit" && <FalseDoor />}
      {method === "withdraw" && <FalseDoor />}
      {method === "redeem" && <FalseDoor />}
      {method === "transfer" && <FalseDoor />}
    </Box>
  );
};

export default Manager;
