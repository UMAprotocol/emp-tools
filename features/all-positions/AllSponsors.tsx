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
      // This will set maxPage to 0 if there are no sponsors.
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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sponsor</TableCell>
              <TableCell align="right">
                <SortableTableColumnHeader sortField={SORT_FIELD.COLLATERAL}>
                  Collateral
                  <br />({collSymbol}){" "}
                </SortableTableColumnHeader>
              </TableCell>
              <TableCell align="right">
                <SortableTableColumnHeader sortField={SORT_FIELD.TOKENS}>
                  Synthetics
                  <br />({tokenSymbol}){" "}
                </SortableTableColumnHeader>
              </TableCell>
              <TableCell align="right">
                <SortableTableColumnHeader sortField={SORT_FIELD.CRATIO}>
                  Collateral Ratio{" "}
                </SortableTableColumnHeader>
              </TableCell>
              <Tooltip
                title={`This is the price that the identifier (${priceIdUtf8}) must increase to in order for the position be liquidatable`}
                placement="top"
              >
                <TableCell align="right">
                  <SortableTableColumnHeader sortField={SORT_FIELD.LIQ_PRICE}>
                    Liquidation Price{" "}
                  </SortableTableColumnHeader>
                </TableCell>
              </Tooltip>
            </TableRow>
          </TableHead>
          <TableBody>
            {reformattedSponsorData.map((sponsor: string) => {
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
                    {prettyBalance(Number(activeSponsor.tokensOutstanding))}
                  </TableCell>
                  <TableCell align="right">
                    {prettyBalance(Number(activeSponsor.cRatio))}
                  </TableCell>
                  <TableCell align="right">
                    {prettyBalance(Number(activeSponsor.liquidationPrice))}
                  </TableCell>
                </TableRow>
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
    );
  } else {
    return <></>;
  }
};

export default AllSponsors;
