import { useState } from "react";
import { Box, Typography } from "@material-ui/core";

import Connection from "../../containers/Connection";
import MethodSelector from "./MethodSelector";
import Create from "./Create";
import Deposit from "./Deposit";
import Redeem from "./Redeem";
import Withdraw from "./Withdraw";
import YourPosition from "./YourPosition";
import YourWallet from "./YourWallet";

export type Method = "create" | "deposit" | "withdraw" | "redeem";

const FalseDoor = () => (
  <Typography>This feature has not been implemented yet.</Typography>
);

const Manager = () => {
  const { signer } = Connection.useContainer();
  const [method, setMethod] = useState<Method>("create");
  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) =>
    setMethod(e.target.value as Method);

  if (!signer) {
    return (
      <Box>
        <Typography>
          <i>Please first connect and select an EMP from the dropdown above.</i>
        </Typography>
      </Box>
    );
  }

  return (
    <Box my={0}>
      <YourWallet />
      <YourPosition />
      <MethodSelector method={method} handleChange={handleChange} />

      {method === "create" && <Create />}
      {method === "deposit" && <Deposit />}
      {method === "withdraw" && <Withdraw />}
      {method === "redeem" && <Redeem />}
    </Box>
  );
};

export default Manager;
