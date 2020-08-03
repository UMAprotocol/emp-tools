import { Box, Typography } from "@material-ui/core";
import { utils } from "ethers";

import EmpState from "../../containers/EmpState";
import PriceFeed from "../../containers/PriceFeed";

import AllLiquidations from "./AllLiquidations";
import AllSponsors from "./AllSponsors";

const AllPositions = () => {
  const { empState } = EmpState.useContainer();
  const { priceIdentifier: priceId } = empState;
  const { latestPrice } = PriceFeed.useContainer();

  if (latestPrice !== null && priceId !== null) {
    const priceIdUtf8 = utils.parseBytes32String(priceId);
    const prettyLatestPrice = Number(latestPrice).toFixed(6);

    return (
      <Box>
        <Box>
          <Typography>
            {`Estimated price of ${prettyLatestPrice} for ${priceIdUtf8}`}
          </Typography>
        </Box>
        <Box pt={4}>
          <AllSponsors />
          <br></br>
          <br></br>
          <AllLiquidations />
        </Box>
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

export default AllPositions;
