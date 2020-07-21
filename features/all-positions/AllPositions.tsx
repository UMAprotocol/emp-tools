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
} from "@material-ui/core";
import styled from "styled-components";
import { utils, BigNumberish } from "ethers";

import EmpState from "../../containers/EmpState";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import EmpSponsors from "../../containers/EmpSponsors";
import EmpContract from "../../containers/EmpContract";
import PriceFeed from "../../containers/PriceFeed";

import { useEtherscanUrl } from "../../utils/useEtherscanUrl";

const Link = styled.a`
  color: white;
  font-size: 18px;
`;

const AllPositions = () => {
  const { empState } = EmpState.useContainer();
  const { priceIdentifier: priceId } = empState;
  const { symbol: tokenSymbol } = Token.useContainer();
  const { symbol: collSymbol } = Collateral.useContainer();
  const { activeSponsors } = EmpSponsors.useContainer();
  const { contract: emp } = EmpContract.useContainer();
  const { latestPrice, sourceUrl } = PriceFeed.useContainer();

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
                  <TableCell align="right">Collateral ({collSymbol})</TableCell>
                  <TableCell align="right">
                    Synthetics ({tokenSymbol})
                  </TableCell>
                  <TableCell align="right">Collateral Ratio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(activeSponsors).map((sponsor: string) => {
                  const activeSponsor = activeSponsors[sponsor];
                  return (
                    activeSponsor?.collateral &&
                    activeSponsor?.tokensOutstanding && (
                      <TableRow key={sponsor}>
                        <TableCell component="th" scope="row">
                          <a
                            href={sponsor ? useEtherscanUrl(sponsor) : "N/A"}
                            target="_blank"
                          >
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
