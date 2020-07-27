import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tooltip,
} from "@material-ui/core";
import styled from "styled-components";
import { utils } from "ethers";
import { useState } from "react";

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

const ClickableText = styled.span`
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  text-align: end;
  user-select: none;
`;

enum SORT_FIELD {
  COLLATERAL,
  TOKENS,
  // CRATIO,
  // LIQ_PRICE
}

const FIELD_TO_VALUE = {
  [SORT_FIELD.COLLATERAL]: "collateral",
  [SORT_FIELD.TOKENS]: "tokensOutstanding",
  // [SORT_FIELD.CRATIO]: 'oneDayTxns',
  // [SORT_FIELD.LIQ_PRICE]: 'oneWeekVolumeUSD'
};

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

  const [sortDirection, setSortDirection] = useState<boolean>(true);
  const [sortedColumn, setSortedColumn] = useState<number>(SORT_FIELD.TOKENS);

  if (
    collateralRequirement !== null &&
    collDecimals !== null &&
    tokenSymbol !== null &&
    collSymbol !== null &&
    emp !== null &&
    latestPrice !== null &&
    priceId !== null &&
    sourceUrl !== undefined
  ) {
    const collReqFromWei = parseFloat(
      fromWei(collateralRequirement, collDecimals)
    );
    const priceIdUtf8 = utils.parseBytes32String(priceId);

    const getCollateralRatio = (collateral: number, tokens: number) => {
      if (tokens <= 0 || latestPrice <= 0) return 0;
      const tokensScaled = tokens * latestPrice;
      return collateral / tokensScaled;
    };

    const prettyBalance = (x: number) => {
      const x_string = x.toFixed(4);
      return utils.commify(x_string);
    };

    const prettyAddress = (x: string) => {
      return x.substr(0, 6) + "..." + x.substr(x.length - 6, x.length);
    };

    return (
      <Box>
        <Box>
          <Typography>
            {`Estimated price of ${latestPrice} for ${priceIdUtf8} sourced from: `}
            <Link href={sourceUrl} target="_blank" rel="noopener noreferrer">
              Coinbase Pro.
            </Link>
          </Typography>
        </Box>
        <Box pt={4}>
          {activeSponsors && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sponsor</TableCell>
                    <TableCell align="right">
                      <ClickableText
                        onClick={(e) => {
                          setSortedColumn(SORT_FIELD.COLLATERAL);
                          setSortDirection(
                            sortedColumn !== SORT_FIELD.COLLATERAL
                              ? true
                              : !sortDirection
                          );
                        }}
                      >
                        Collateral
                        <br />({collSymbol})
                      </ClickableText>
                    </TableCell>
                    <TableCell align="right">
                      <ClickableText
                        onClick={(e) => {
                          setSortedColumn(SORT_FIELD.TOKENS);
                          setSortDirection(
                            sortedColumn !== SORT_FIELD.TOKENS
                              ? true
                              : !sortDirection
                          );
                        }}
                      >
                        Synthetics
                        <br />({tokenSymbol})
                      </ClickableText>
                    </TableCell>
                    <TableCell align="right">Collateral Ratio</TableCell>
                    <Tooltip
                      title={`This is the price that the identifier (${priceIdUtf8}) must increase to in order for the position be liquidatable`}
                      placement="top"
                    >
                      <TableCell align="right">Liquidation Price</TableCell>
                    </Tooltip>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(activeSponsors)
                    .filter((sponsor: string) => {
                      return (
                        activeSponsors[sponsor]?.collateral &&
                        activeSponsors[sponsor]?.tokensOutstanding
                      );
                    })
                    .sort((sponsorA: string, sponsorB: string) => {
                      const fieldValueA =
                        activeSponsors[sponsorA]["collateral"];
                      const fieldValueB =
                        activeSponsors[sponsorB]["collateral"];
                      return Number(fieldValueA) > Number(fieldValueB)
                        ? (sortDirection ? -1 : 1) * 1
                        : (sortDirection ? -1 : 1) * -1;
                    })
                    .map((sponsor: string) => {
                      const activeSponsor = activeSponsors[sponsor];
                      return (
                        <TableRow key={sponsor}>
                          <TableCell component="th" scope="row">
                            <a href={getEtherscanUrl(sponsor)} target="_blank">
                              {prettyAddress(sponsor)}
                            </a>
                          </TableCell>
                          <TableCell align="right">
                            {prettyBalance(Number(activeSponsor.collateral))}
                          </TableCell>
                          <TableCell align="right">
                            {prettyBalance(
                              Number(activeSponsor.tokensOutstanding)
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {prettyBalance(
                              getCollateralRatio(
                                Number(activeSponsor.collateral),
                                Number(activeSponsor.tokensOutstanding)
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
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
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
