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

import Token from "../../containers/Token";
import EmpSponsors from "../../containers/EmpSponsors";
import EmpContract from "../../containers/EmpContract";
import PriceFeed from "../../containers/PriceFeed";

const Link = styled.a`
  color: white;
  font-size: 18px;
`;

const AllPositions = () => {
  const { symbol: tokenSymbol } = Token.useContainer();
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
    return utils.commify(x as string);
  };

  const getCollateralRatio = (
    collateral: BigNumberish,
    tokens: BigNumberish
  ) => {
    if (!latestPrice) return null;
    const tokensScaled = Number(tokens) * Number(latestPrice);
    return Number(collateral) / tokensScaled;
  };

  return (
    <Container>
      <Box>
        <Typography>
          <i>Estimated prices are sourced from the latest trade data on: </i>
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
                  <TableCell>Active Sponsor</TableCell>
                  <TableCell align="right">Locked Collateral</TableCell>
                  <TableCell align="right">Tokens Outstanding</TableCell>
                  <TableCell align="right">
                    Collateral Ratio (using price:{" "}
                    {latestPrice ? latestPrice : "N/A"})
                  </TableCell>
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
                          {sponsor}
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
