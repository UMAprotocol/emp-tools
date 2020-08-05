import { useState, useEffect } from "react";
import { Box, Typography } from "@material-ui/core";

import Connection from "../../containers/Connection";
import EmpState from "../../containers/EmpState";
import MethodSelector from "./MethodSelector";
import Create from "./Create";
import Deposit from "./Deposit";
import Redeem from "./Redeem";
import Withdraw from "./Withdraw";
import SettleExpired from "./SettleExpired";
import YourPosition from "./YourPosition";
import YourLiquidations from "./YourLiquidations";
import YourWallet from "./YourWallet";

export type Method = "create" | "deposit" | "withdraw" | "redeem" | "settle";
const DEFAULT_METHOD = "create";

const Manager = () => {
  const { signer } = Connection.useContainer();
  const { empState } = EmpState.useContainer();
  const { isExpired } = empState;
  const [method, setMethod] = useState<Method>(DEFAULT_METHOD);
  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) =>
    setMethod(e.target.value as Method);

  if (signer !== null && isExpired !== null) {
    // Whenever the expiry state changes, check if we should change the default method.
    useEffect(() => {
      setMethod(DEFAULT_METHOD);
      if (isExpired) {
        setMethod("settle");
      }
    }, [isExpired]);

    return (
      <Box my={0}>
        <YourWallet />
        <YourLiquidations />
        <YourPosition />
        <MethodSelector method={method} handleChange={handleChange} />

        {method === "create" && <Create />}
        {method === "deposit" && <Deposit />}
        {method === "withdraw" && <Withdraw />}
        {method === "redeem" && <Redeem />}
        {method === "settle" && <SettleExpired />}
      </Box>
    );
  } else {
    return (
      <Box>
        <Typography>
          <i>Please first connect and select an EMP from the dropdown above.</i>
        </Typography>
      </Box>
    );
  }
};

export default Manager;
