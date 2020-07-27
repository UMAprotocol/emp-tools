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
import { useState, useEffect } from "react";

import EmpState from "../../containers/EmpState";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import EmpSponsors from "../../containers/EmpSponsors";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";

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

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`;

type FadedDiv = {
  faded: boolean;
};

const Arrow = styled.div<FadedDiv>`
  color: ${({ theme }) => theme.primary1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`;

enum SORT_FIELD {
  COLLATERAL,
  TOKENS,
  CRATIO,
  LIQ_PRICE,
}

const FIELD_TO_VALUE: { [sortField: number]: string } = {
  [SORT_FIELD.COLLATERAL]: "collateral",
  [SORT_FIELD.TOKENS]: "tokensOutstanding",
  [SORT_FIELD.CRATIO]: "cRatio",
  [SORT_FIELD.LIQ_PRICE]: "liquidationPrice",
};

const ITEMS_PER_PAGE = 10;

const AllPositions = () => {
  const { empState } = EmpState.useContainer();
  const { priceIdentifier: priceId } = empState;
  const { symbol: tokenSymbol } = Token.useContainer();
  const { symbol: collSymbol } = Collateral.useContainer();
  const { activeSponsors } = EmpSponsors.useContainer();
  const { latestPrice, sourceUrl } = PriceFeed.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(1);

  // Sorting
  const [sortDirection, setSortDirection] = useState<boolean>(true);
  const [sortedColumn, setSortedColumn] = useState<number>(SORT_FIELD.TOKENS);

  // Set max page depending on # of sponsors
  useEffect(() => {
    setMaxPage(1);
    setPage(1);

    if (activeSponsors) {
      let extraPages = 1;
      if (Object.keys(activeSponsors).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0;
      }
      setMaxPage(
        Math.floor(Object.keys(activeSponsors).length / ITEMS_PER_PAGE) +
          extraPages
      );
    }
  }, [activeSponsors]);

  if (
    tokenSymbol !== null &&
    collSymbol !== null &&
    latestPrice !== null &&
    priceId !== null &&
    sourceUrl !== undefined
  ) {
    const priceIdUtf8 = utils.parseBytes32String(priceId);

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
                        <br />({collSymbol}){" "}
                        {sortedColumn === SORT_FIELD.COLLATERAL
                          ? !sortDirection
                            ? "↑"
                            : "↓"
                          : ""}
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
                        <br />({tokenSymbol}){" "}
                        {sortedColumn === SORT_FIELD.TOKENS
                          ? !sortDirection
                            ? "↑"
                            : "↓"
                          : ""}
                      </ClickableText>
                    </TableCell>
                    <TableCell align="right">
                      <ClickableText
                        onClick={(e) => {
                          setSortedColumn(SORT_FIELD.CRATIO);
                          setSortDirection(
                            sortedColumn !== SORT_FIELD.CRATIO
                              ? true
                              : !sortDirection
                          );
                        }}
                      >
                        Collateral Ratio{" "}
                        {sortedColumn === SORT_FIELD.CRATIO
                          ? !sortDirection
                            ? "↑"
                            : "↓"
                          : ""}
                      </ClickableText>
                    </TableCell>
                    <Tooltip
                      title={`This is the price that the identifier (${priceIdUtf8}) must increase to in order for the position be liquidatable`}
                      placement="top"
                    >
                      <TableCell align="right">
                        <ClickableText
                          onClick={(e) => {
                            setSortedColumn(SORT_FIELD.LIQ_PRICE);
                            setSortDirection(
                              sortedColumn !== SORT_FIELD.LIQ_PRICE
                                ? true
                                : !sortDirection
                            );
                          }}
                        >
                          Liquidation Price{" "}
                          {sortedColumn === SORT_FIELD.LIQ_PRICE
                            ? !sortDirection
                              ? "↑"
                              : "↓"
                            : ""}
                        </ClickableText>
                      </TableCell>
                    </Tooltip>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(activeSponsors)
                    .filter((sponsor: string) => {
                      return (
                        activeSponsors[sponsor]?.collateral &&
                        activeSponsors[sponsor]?.tokensOutstanding &&
                        activeSponsors[sponsor]?.cRatio &&
                        activeSponsors[sponsor]?.liquidationPrice
                      );
                    })
                    .sort((sponsorA: string, sponsorB: string) => {
                      const fieldValueA =
                        activeSponsors[sponsorA][FIELD_TO_VALUE[sortedColumn]];
                      const fieldValueB =
                        activeSponsors[sponsorB][FIELD_TO_VALUE[sortedColumn]];
                      return Number(fieldValueA) > Number(fieldValueB)
                        ? (sortDirection ? -1 : 1) * 1
                        : (sortDirection ? -1 : 1) * -1;
                    })
                    .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
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
                            {prettyBalance(Number(activeSponsor.cRatio))}
                          </TableCell>
                          <TableCell align="right">
                            {prettyBalance(
                              Number(activeSponsor.liquidationPrice)
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              <PageButtons>
                <div
                  onClick={(e) => {
                    setPage(page === 1 ? page : page - 1);
                  }}
                >
                  <Arrow faded={page === 1 ? true : false}>←</Arrow>
                </div>
                {"Page " + page + " of " + maxPage}
                <div
                  onClick={(e) => {
                    setPage(page === maxPage ? page : page + 1);
                  }}
                >
                  <Arrow faded={page === maxPage ? true : false}>→</Arrow>
                </div>
              </PageButtons>
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
