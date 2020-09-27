import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@material-ui/core";
import styled from "styled-components";
import { utils } from "ethers";
import { useState, useEffect } from "react";

import EmpState from "../../containers/EmpState";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import EmpSponsors from "../../containers/EmpSponsors";
import Etherscan from "../../containers/Etherscan";

import { isPricefeedInvertedFromTokenSymbol } from "../../utils/getOffchainPrice";

import PositionActionsDialog from "./PositionActionsDialog";

interface SortableTableHeaderProps {
  children: React.ReactNode;
  sortField: number;
}

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
  margin-bottom: 2em;
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

const AllSponsors = () => {
  const { empState } = EmpState.useContainer();
  const { priceIdentifier: priceId } = empState;
  const { symbol: tokenSymbol } = Token.useContainer();
  const { symbol: collSymbol } = Collateral.useContainer();
  const { activeSponsors } = EmpSponsors.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  const invertedPrice = isPricefeedInvertedFromTokenSymbol(tokenSymbol);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(1);

  // Sorting
  const [sortDirection, setSortDirection] = useState<boolean>(true);
  const [sortedColumn, setSortedColumn] = useState<number>(SORT_FIELD.TOKENS);

  // Extra info dialog
  const [isDialogShowing, setIsDialogShowing] = useState<boolean>(false);
  const [selectedSponsor, setSelectedSponsor] = useState<string | null>(null);

  // Set max page depending on # of sponsors
  useEffect(() => {
    setMaxPage(1);
    setPage(1);

    if (activeSponsors) {
      const extraPages =
        Object.keys(activeSponsors).length % ITEMS_PER_PAGE === 0 ? 0 : 1;
      setMaxPage(
        Math.floor(Object.keys(activeSponsors).length / ITEMS_PER_PAGE) +
          extraPages
      );
    }
  }, [activeSponsors]);

  if (
    tokenSymbol !== null &&
    collSymbol !== null &&
    priceId !== null &&
    activeSponsors &&
    Object.keys(activeSponsors).length > 0
  ) {
    const priceIdUtf8 = utils.parseBytes32String(priceId);

    const prettyBalance = (x: number) => {
      const x_string = x.toFixed(4);
      return utils.commify(x_string);
    };

    const prettyAddress = (x: string) => {
      return x.substr(0, 6) + "..." + x.substr(x.length - 6, x.length);
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
      <div>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>
                    Sponsor
                    <br /> Address
                  </strong>
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
                  title={`This is the price that the identifier (${priceIdUtf8}) must ${
                    invertedPrice ? "decrease" : "increase"
                  } to in order for the position be liquidatable`}
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
        <PositionActionsDialog
          isDialogShowing={isDialogShowing}
          handleClose={() => setIsDialogShowing(!isDialogShowing)}
          selectedSponsor={selectedSponsor}
        />
      </div>
    );
  } else {
    return <></>;
  }
};

export default AllSponsors;
