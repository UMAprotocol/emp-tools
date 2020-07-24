import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Typography,
  Tooltip,
} from "@material-ui/core";
import styled from "styled-components";
import { utils, BigNumberish } from "ethers";

import EmpState from "../../containers/EmpState";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import EmpSponsors from "../../containers/EmpSponsors";
import EmpContract from "../../containers/EmpContract";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";

import { getLiquidationPrice } from "../../utils/getLiquidationPrice";

const fromWei = utils.formatUnits;

const Link = styled.a`
  color: white;
  font-size: 18px;
`;

const AllPositions = () => {
  const { empState } = EmpState.useContainer();
  const { priceIdentifier: priceId } = empState;
  const { symbol: tokenSymbol } = Token.useContainer();
  const {
    symbol: collSymbol,
    decimals: collDecimals,
  } = Collateral.useContainer();
  const { activeSponsors } = EmpSponsors.useContainer();
  const { contract: emp } = EmpContract.useContainer();
  const { latestPrice, sourceUrl } = PriceFeed.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  const { collateralRequirement } = empState;
  const collReqFromWei =
    collateralRequirement && collDecimals
      ? parseFloat(fromWei(collateralRequirement, collDecimals))
      : null;

  if (tokenSymbol === null || emp === null) {
    return (
      <Container>
        <Box py={2}>
          <Typography>
            <i>Please first select an EMP from the dropdown above.</i>
          </Typography>
        </Box>
      </Container>
    );
  }

  const prettyBalance = (x: BigNumberish | null) => {
    if (!x) return "N/A";
    x = Number(x).toFixed(4);
    return utils.commify(x as string);
  };

  const prettyAddress = (x: String | null) => {
    if (!x) return "N/A";
    return x.substr(0, 6) + "..." + x.substr(x.length - 6, x.length);
  };

  const getCollateralRatio = (
    collateral: BigNumberish,
    tokens: BigNumberish
  ) => {
    if (!latestPrice) return null;
    const tokensScaled = Number(tokens) * Number(latestPrice);
    return (Number(collateral) / tokensScaled).toFixed(4);
  };

  return (
    <Container>
      <Box>
        <Typography>
          <i>
            Estimated price of{" "}
            {latestPrice ? Number(latestPrice).toFixed(4) : "N/A"} for{" "}
            {priceId ? utils.parseBytes32String(priceId) : "N/A"} sourced from{" "}
          </i>
          <Link href={sourceUrl} target="_blank" rel="noopener noreferrer">
            Coinbase Pro.
          </Link>
        </Typography>
      </Box>
      <Box py={4}>
        {activeSponsors && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sponsor</TableCell>
                  <TableCell align="right">
                    Collateral
                    <br />({collSymbol})
                  </TableCell>
                  <TableCell align="right">
                    Synthetics
                    <br />({tokenSymbol})
                  </TableCell>
                  <TableCell align="right">Collateral Ratio</TableCell>
                  <Tooltip
                    title={`This is the price that the identifier (${
                      priceId ? utils.parseBytes32String(priceId) : "N/A"
                    }) must increase to in order for the position be liquidatable`}
                    placement="top"
                  >
                    <TableCell align="right">Liquidation Price</TableCell>
                  </Tooltip>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(activeSponsors).map((sponsor: string) => {
                  const activeSponsor = activeSponsors[sponsor];
                  return (
                    activeSponsor?.collateral &&
                    activeSponsor?.tokensOutstanding &&
                    collReqFromWei && (
                      <TableRow key={sponsor}>
                        <TableCell component="th" scope="row">
                          <a href={getEtherscanUrl(sponsor)} target="_blank">
                            {prettyAddress(sponsor)}
                          </a>
                        </TableCell>
                        <TableCell align="right">
                          {prettyBalance(activeSponsor.collateral)}
                        </TableCell>
                        <TableCell align="right">
                          {prettyBalance(activeSponsor.tokensOutstanding)}
                        </TableCell>
                        <TableCell align="right">
                          {prettyBalance(
                            getCollateralRatio(
                              activeSponsor.collateral,
                              activeSponsor.tokensOutstanding
                            )
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {prettyBalance(
                            getLiquidationPrice(
                              Number(activeSponsor.collateral),
                              Number(activeSponsor.tokensOutstanding),
                              collReqFromWei
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default AllPositions;
