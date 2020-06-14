import { Box, Button } from "@material-ui/core";
import Connection from "../../containers/Connection";
import { ethers } from "ethers";
import uma from "@studydefi/money-legos/uma";

const Create = () => {
  const { signer } = Connection.useContainer();
  const query = async () => {
    if (signer) {
      const empCreator = new ethers.Contract(
        uma.expiringMultiPartyCreator.address,
        uma.expiringMultiPartyCreator.abi,
        signer
      );
      const myFilter = empCreator.filters.CreatedExpiringMultiParty(null, null);
      const res = await empCreator.queryFilter(myFilter, 0, 10266076);
      console.log(res);
    }
  };
  return (
    <Box>
      Create Form here
      <Button onClick={query}>Click</Button>
    </Box>
  );
};

export default Create;
