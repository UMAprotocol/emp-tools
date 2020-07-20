import { useEffect, useState } from "react";

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
  Dialog,
  Button,
  TextField,
  Tab,
  Tabs,
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

const MoreInfo = styled.a`
  height: 20px;
  width: 20px;
  background-color: #303030;
  border-radius: 50%;
  display: inline-block;
  text-align: center;

  &:hover {
    background-color: white;
    transition: 0.5s;
    cursor: pointer;
  }
`;

const PositionDialog = styled.div`
  width: 100%;
  border-color: white;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
`;

const StyledTabs = styled(Tabs)`
  & .MuiTabs-flexContainer {
    border-bottom: 1px solid #999;
  }
  & .Mui-selected {
    font-weight: bold;
  }
  padding-bottom: 2rem;
`;

const AllPositions = () => {
  const { empState } = EmpState.useContainer();
  const { priceIdentifier: priceId } = empState;
  const { symbol: tokenSymbol } = Token.useContainer();
  const { symbol: collSymbol } = Collateral.useContainer();
  const { activeSponsors } = EmpSponsors.useContainer();
  const { contract: emp } = EmpContract.useContainer();
  const { latestPrice, sourceUrl } = PriceFeed.useContainer();

  const [openDialog, setOpenDialog] = useState<boolean | null>(false);
  const [dialogAddress, setDialogAddress] = useState<string | null>("");
  const [dialogTabIndex, setDialogTabIndex] = useState(0);
  const [depositTokens, setDepositTokens] = useState<string>("");

  const handleOpen = (address: string) => {
    setOpenDialog(true);
    setDialogAddress(address);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setDialogAddress("");
  };

  const handelLiquidate = () => {};

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
            val: {JSON.stringify(openDialog)}
            Estimated price of {latestPrice ? latestPrice : "N/A"} for{" "}
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
                  <TableCell align="right"></TableCell>
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
                          <a href={sponsor ? useEtherscanUrl(sponsor) : "N/A"}>
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
                          <MoreInfo onClick={() => handleOpen(sponsor)}>
                            ⋮
                          </MoreInfo>
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

      <Dialog
        open={openDialog || false}
        onClose={handleClose}
        aria-labelledby="simple-Dialog-title"
        aria-describedby="simple-Dialog-description"
      >
        <PositionDialog>
          <h1>Additional Position Actions</h1>
          <ul>
            <li>
              Sponsor:{" "}
              <a href={dialogAddress ? useEtherscanUrl(dialogAddress) : "N/A"}>
                {prettyAddress(dialogAddress)}
              </a>
            </li>
            <li>
              Position Collateral({collSymbol}):{" "}
              {dialogAddress &&
                prettyBalance(activeSponsors[dialogAddress].collateral)}
            </li>
            <li>
              Minted Synthetics({tokenSymbol}):{" "}
              {dialogAddress &&
                prettyBalance(activeSponsors[dialogAddress].tokensOutstanding)}
            </li>
            <li>Pending withdrawal: No</li>
            <li>Pending Transfer: No</li>
            <li>
              Collateralization ratio:{" "}
              {dialogAddress &&
                prettyBalance(
                  getCollateralRatio(
                    activeSponsors[dialogAddress].collateral,
                    activeSponsors[dialogAddress].tokensOutstanding
                  )
                )}
            </li>
          </ul>

          <StyledTabs
            value={dialogTabIndex}
            onChange={(_, i) => setDialogTabIndex(i)}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Liquidate" disableRipple />
            <Tab label="Deposit" disableRipple />
          </StyledTabs>

          {dialogTabIndex === 0 && (
            <Button
              variant="contained"
              onClick={handelLiquidate}
            >{`Liquidate Position`}</Button>
          )}
          {dialogTabIndex === 1 && (
            <TextField
              type="number"
              label={`Deposit ${collSymbol}`}
              placeholder="1234"
              inputProps={{ min: "0" }}
              value={depositTokens}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDepositTokens(e.target.value)
              }
            />
          )}
        </PositionDialog>
      </Dialog>
    </Container>
  );
};

export default AllPositions;
