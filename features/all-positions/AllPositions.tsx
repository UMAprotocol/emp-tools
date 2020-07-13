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
import { utils, BigNumberish, BigNumber } from "ethers";

import Token from "../../containers/Token";
import EmpSponsors from "../../containers/EmpSponsors";
import EmpContract from "../../containers/EmpContract";

const AllPositions = () => {
  const { symbol: tokenSymbol } = Token.useContainer();
  const { activeSponsors } = EmpSponsors.useContainer();
  const { contract: emp } = EmpContract.useContainer();

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

  const estimatedPrice = tokenSymbol?.includes("yCOMP") ? "187" : "0.0259";

  const activeEmpSponsors = activeSponsors[emp.address];

  const prettyBalance = (x: BigNumberish | null) => {
    return x === null ? "N/A" : utils.commify(utils.formatEther(x));
  };

  const getCollateralRatio = (
    collateral: BigNumber | null,
    tokens: BigNumber | null
  ) => {
    if (collateral === null || tokens === null) return "N/A";
    const tokensScaled = tokens
      .mul(utils.parseEther(estimatedPrice))
      .div(utils.parseEther("1"));
    return collateral.mul(utils.parseEther("1")).div(tokensScaled);
  };

  return (
    <Box py={4}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Active Sponsor</TableCell>
              <TableCell align="right">Locked Collateral</TableCell>
              <TableCell align="right">Tokens Outstanding</TableCell>
              <TableCell align="right">
                Collateral Ratio (estimated price: {estimatedPrice})
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeEmpSponsors &&
              Object.keys(activeEmpSponsors).map((sponsor: string) => (
                <TableRow key={sponsor}>
                  <TableCell component="th" scope="row">
                    {sponsor}
                  </TableCell>
                  <TableCell align="right">
                    {prettyBalance(activeEmpSponsors[sponsor].lockedCollateral)}
                  </TableCell>
                  <TableCell align="right">
                    {prettyBalance(
                      activeEmpSponsors[sponsor].tokensOutstanding
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {prettyBalance(
                      getCollateralRatio(
                        activeEmpSponsors[sponsor].lockedCollateral,
                        activeEmpSponsors[sponsor].tokensOutstanding
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AllPositions;
