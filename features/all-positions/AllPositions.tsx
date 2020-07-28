import { useState, MouseEvent, useEffect } from "react";
import { ethers, utils } from "ethers";
const fromWei = ethers.utils.formatUnits;
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tooltip,
  Dialog,
} from "@material-ui/core";

import styled from "styled-components";

import EmpState from "../../containers/EmpState";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import EmpSponsors from "../../containers/EmpSponsors";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";

import PositionActionsDialog from "./PositionActionsDialog";

interface SortableTableHeaderProps {
  children: React.ReactNode;
  sortField: number;
}

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

const MoreInfo = styled.a`
  height: 23px;
  width: 23px;
  background-color: #303030;
  border-radius: 50%;
  display: inline-block;
  text-align: center;
  &:hover {
    background-color: white;
    transition: 0.3s;
    cursor: pointer;
  }
`;

const StyledTableRow = styled(TableRow)`
  &:hover {
    transition: 0.1s;
    background-color: #636363;
  }
`;

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 2em;
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
  const [isDialogShowing, setIsDialogShowing] = useState<boolean>(false);
  const [selectedSponsor, setSelectedSponsor] = useState<string | null>(null);
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
      // This will set maxPage to 0 if there are no sponsors.
    }
  }, [activeSponsors]);

  if (
    tokenSymbol !== null &&
    collSymbol !== null &&
    latestPrice !== null &&
    priceId !== null &&
    sourceUrl !== undefined &&
    activeSponsors &&
    Object.keys(activeSponsors).length > 0
  ) {
    const priceIdUtf8 = utils.parseBytes32String(priceId);
    const prettyLatestPrice = Number(latestPrice).toFixed(6);

    const prettyBalance = (x: number) => {
      const x_string = x.toFixed(4);
      return utils.commify(x_string);
    };

    const prettyAddress = (x: string) => {
      return x.substr(0, 6) + "..." + x.substr(x.length - 6, x.length);
    };

    const toggleDialog = () => {
      setIsDialogShowing(!isDialogShowing);
    };

    const handleOpenActionsDialog = (address: string) => {
      setSelectedSponsor(address);
      setIsDialogShowing(true);
    };

    // First filters out sponsor data missing field values,
    // then sorts the positions according to selected sort column,
    // and finally slices the array based on pagination selection.
    const reformattedSponsorData = Object.keys(activeSponsors)
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
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE);

    const SortableTableColumnHeader = ({
      children,
      sortField,
    }: SortableTableHeaderProps) => {
      return (
        <ClickableText
          onClick={(e) => {
            setSortedColumn(sortField);
            setSortDirection(
              sortedColumn !== sortField ? true : !sortDirection
            );
          }}
        >
          {children}
          {sortedColumn === sortField ? (!sortDirection ? "↑" : "↓") : ""}
        </ClickableText>
      );
    };

    return (
      <Box>
        <Box>
          <Typography>
            {`Estimated price of ${prettyLatestPrice} for ${priceIdUtf8} sourced from: `}
            <Link href={sourceUrl} target="_blank" rel="noopener noreferrer">
              Coinbase Pro.
            </Link>
          </Typography>
        </Box>
        <Box pt={4}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Sponsor</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      <SortableTableColumnHeader
                        sortField={SORT_FIELD.COLLATERAL}
                      >
                        Collateral
                        <br />({collSymbol}){" "}
                      </SortableTableColumnHeader>
                    </strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      <SortableTableColumnHeader sortField={SORT_FIELD.TOKENS}>
                        Synthetics
                        <br />({tokenSymbol}){" "}
                      </SortableTableColumnHeader>
                    </strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      <SortableTableColumnHeader sortField={SORT_FIELD.CRATIO}>
                        Collateral
                        <br /> Ratio{" "}
                      </SortableTableColumnHeader>
                    </strong>
                  </TableCell>
                  <Tooltip
                    title={`This is the price that the identifier (${priceIdUtf8}) must decrease to in order for the position be liquidatable`}
                    placement="top"
                  >
                    <TableCell align="right">
                      <strong>
                        <SortableTableColumnHeader
                          sortField={SORT_FIELD.LIQ_PRICE}
                        >
                          Liquidation
                          <br /> Price{" "}
                        </SortableTableColumnHeader>
                      </strong>
                    </TableCell>
                  </Tooltip>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reformattedSponsorData.map((sponsor: string) => {
                  const activeSponsor = activeSponsors[sponsor];
                  return (
                    <StyledTableRow key={sponsor}>
                      <TableCell component="th" scope="row">
                        <a href={getEtherscanUrl(sponsor)} target="_blank">
                          {prettyAddress(sponsor)}
                        </a>
                      </TableCell>
                      <TableCell align="right">
                        {prettyBalance(Number(activeSponsor.collateral))}
                      </TableCell>
                      <TableCell align="right">
                        {prettyBalance(Number(activeSponsor.tokensOutstanding))}
                      </TableCell>
                      <TableCell align="right">
                        {prettyBalance(Number(activeSponsor.cRatio))}
                      </TableCell>
                      <TableCell align="right">
                        {prettyBalance(Number(activeSponsor.liquidationPrice))}
                      </TableCell>
                      <TableCell align="right">
                        <MoreInfo
                          onClick={() => handleOpenActionsDialog(sponsor)}
                        >
                          ⋮
                        </MoreInfo>
                      </TableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
            <PageButtons>
              <div
                onClick={() => {
                  setPage(page === 1 ? page : page - 1);
                }}
              >
                <Arrow faded={page === 1 ? true : false}>←</Arrow>
              </div>
              {"Page " + page + " of " + maxPage}
              <div
                onClick={() => {
                  setPage(page === maxPage ? page : page + 1);
                }}
              >
                <Arrow faded={page === maxPage ? true : false}>→</Arrow>
              </div>
            </PageButtons>
          </TableContainer>
        </Box>
        <PositionActionsDialog
          isDialogShowing={isDialogShowing}
          handleClose={toggleDialog}
          selectedSponsor={selectedSponsor}
        />
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
