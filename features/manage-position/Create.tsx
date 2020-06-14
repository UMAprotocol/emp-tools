import { Box, Button } from "@material-ui/core";
import Connection from "../../containers/Connection";
import { ethers } from "ethers";
import Contract from "../../containers/Contract";

const Create = () => {
  const { signer } = Connection.useContainer();
  const { contract: emp } = Contract.useContainer();

  return (
    <Box>
      Create Form here
      <Button>Click</Button>
    </Box>
  );
};

export default Create;
