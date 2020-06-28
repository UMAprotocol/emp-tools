import { Box } from "@material-ui/core";

import GeneralInfo from "./GeneralInfo";
import CollateralInfo from "./CollateralInfo";
import TokenInfo from "./TokenInfo";
import DisputeParams from "./DisputeParams";

const ContractState = () => {
  return (
    <Box py={4}>
      <GeneralInfo />
      <CollateralInfo />
      <TokenInfo />
      <DisputeParams />
    </Box>
  );
};

export default ContractState;
