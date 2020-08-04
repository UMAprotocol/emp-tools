import { Box, Typography } from "@material-ui/core";
import { utils } from "ethers";

import EmpState from "../../containers/EmpState";
import PriceFeed from "../../containers/PriceFeed";
import Token from "../../containers/Token";
import { isPricefeedInvertedFromTokenSymbol } from "../../utils/getOffchainPrice";

import AllLiquidations from "./AllLiquidations";
import AllSponsors from "./AllSponsors";

const AllPositions = () => {
  const { empState } = EmpState.useContainer();
  const { priceIdentifier: priceId } = empState;
  const { latestPrice } = PriceFeed.useContainer();
  const { symbol } = Token.useContainer();

  if (latestPrice !== null && priceId !== null && symbol !== null) {
    const priceIdUtf8 = utils.parseBytes32String(priceId);
    const invertedPrice = isPricefeedInvertedFromTokenSymbol(symbol);
    const prettyLatestPrice =
      invertedPrice && latestPrice > 0
        ? (1 / latestPrice).toFixed(6)
        : latestPrice.toFixed(6);

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
