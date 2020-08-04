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
  LIQUIDATED_CR,
  MAX_DISPUTABLE_PRICE,
  LOCKED_COLLATERAL,
  TOKENS_LIQUIDATED,
  LIQUIDATION_TIMESTAMP,
}

const FIELD_TO_VALUE: { [sortField: number]: string } = {
  [SORT_FIELD.LIQUIDATED_CR]: "liquidatedCR",
  [SORT_FIELD.MAX_DISPUTABLE_PRICE]: "maxDisputablePrice",
  [SORT_FIELD.LOCKED_COLLATERAL]: "lockedCollateral",
  [SORT_FIELD.TOKENS_LIQUIDATED]: "tokensLiquidated",
  [SORT_FIELD.LIQUIDATION_TIMESTAMP]: "liquidationTimestamp",
};

const ITEMS_PER_PAGE = 10;

const AllLiquidations = () => {
  const { empState } = EmpState.useContainer();
  const { priceIdentifier: priceId } = empState;
  const { symbol: tokenSymbol } = Token.useContainer();
  const { symbol: collSymbol } = Collateral.useContainer();
  const { liquidations } = EmpSponsors.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(1);

  // Sorting
  const [sortDirection, setSortDirection] = useState<boolean>(true);
  const [sortedColumn, setSortedColumn] = useState<number>(
    SORT_FIELD.TOKENS_LIQUIDATED
  );

  // Set max page depending on # of liqs
  useEffect(() => {
    setMaxPage(1);
    setPage(1);

    if (liquidations) {
      let extraPages = 1;
      if (Object.keys(liquidations).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0;
      }
      setMaxPage(
        Math.floor(Object.keys(liquidations).length / ITEMS_PER_PAGE) +
          extraPages
      );
      // This will set maxPage to 0 if there are no liqs.
    }
  }, [liquidations]);

  if (
    tokenSymbol !== null &&
    collSymbol !== null &&
    priceId !== null &&
    liquidations &&
    Object.keys(liquidations).length > 0
  ) {
    const prettyBalance = (x: number) => {
      const x_string = x.toFixed(4);
      return utils.commify(x_string);
    };

    const prettyDate = (x_secs: number) => {
      return new Date(x_secs * 1000).toLocaleString("en-GB", {
        timeZone: "UTC",
      });
    };

    const prettyAddress = (x: string) => {
      return x.substr(0, 6) + "..." + x.substr(x.length - 6, x.length);
    };

    const invertDisputablePrice = isPricefeedInvertedFromTokenSymbol(
      tokenSymbol
    );
    const getDisputablePrice = (x: string) => {
      return invertDisputablePrice && parseFloat(x) !== 0
        ? 1 / Number(x)
        : Number(x);
    };

    // First filters out liq. data missing field values,
    // then sorts the positions according to selected sort column,
    // and finally slices the array based on pagination selection.
    const reformattedLiquidationData = Object.keys(liquidations)
      .filter((sponsor: string) => {
        return (
          liquidations[sponsor]?.liquidatedCR &&
          liquidations[sponsor]?.maxDisputablePrice &&
          liquidations[sponsor]?.tokensLiquidated &&
          liquidations[sponsor]?.lockedCollateral &&
          liquidations[sponsor]?.liquidationTimestamp
        );
      })
      .sort((sponsorA: string, sponsorB: string) => {
        const fieldValueA =
          liquidations[sponsorA][FIELD_TO_VALUE[sortedColumn]];
        const fieldValueB =
          liquidations[sponsorB][FIELD_TO_VALUE[sortedColumn]];
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
                <SortableTableColumnHeader
                  sortField={SORT_FIELD.LOCKED_COLLATERAL}
                >
                  Locked Collateral
                  <br />({collSymbol}){" "}
                </SortableTableColumnHeader>
              </TableCell>
              <TableCell align="right">
                <SortableTableColumnHeader
                  sortField={SORT_FIELD.TOKENS_LIQUIDATED}
                >
                  Synthetics
                  <br />({tokenSymbol}){" "}
                </SortableTableColumnHeader>
              </TableCell>
              <Tooltip
                title={`This is the number of collateral (including any withdrawal requests) divided by the number of tokens liquidated`}
                placement="top"
              >
                <TableCell align="right">
                  <SortableTableColumnHeader
                    sortField={SORT_FIELD.LIQUIDATED_CR}
                  >
                    Liquidated Collateral Ratio{" "}
                  </SortableTableColumnHeader>
                </TableCell>
              </Tooltip>
              <Tooltip
                title={`If the index price at the liquidation timestamp was ${
                  invertDisputablePrice ? `above` : `below`
                } this, then the liquidation would be disputable`}
                placement="top"
              >
                <TableCell align="right">
                  <SortableTableColumnHeader
                    sortField={SORT_FIELD.MAX_DISPUTABLE_PRICE}
                  >
                    {invertDisputablePrice ? `Min` : `Max`} Disputable Price{" "}
                  </SortableTableColumnHeader>
                </TableCell>
              </Tooltip>
              <TableCell align="right">
                <SortableTableColumnHeader
                  sortField={SORT_FIELD.LIQUIDATION_TIMESTAMP}
                >
                  Liquidation Timestamp{" "}
                </SortableTableColumnHeader>
              </TableCell>
              <TableCell align="right">Liquidation Receipt </TableCell>
              <TableCell align="right">Liquidator </TableCell>
              <TableCell align="right">Disputer </TableCell>
              <TableCell align="right">Liquidation ID for sponsor </TableCell>
              <TableCell align="right">Status </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reformattedLiquidationData.map((sponsor: string) => {
              const liquidation = liquidations[sponsor];
              return (
                <TableRow key={sponsor}>
                  <TableCell component="th" scope="row">
                    <a href={getEtherscanUrl(sponsor)} target="_blank">
                      {prettyAddress(sponsor)}
                    </a>
                  </TableCell>
                  <TableCell align="right">
                    {prettyBalance(Number(liquidation.lockedCollateral))}
                  </TableCell>
                  <TableCell align="right">
                    {prettyBalance(Number(liquidation.tokensLiquidated))}
                  </TableCell>
                  <TableCell align="right">
                    {prettyBalance(Number(liquidation.liquidatedCR))}
                  </TableCell>
                  <TableCell align="right">
                    {prettyBalance(
                      getDisputablePrice(liquidation.maxDisputablePrice)
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {prettyDate(Number(liquidation.liquidationTimestamp))}
                  </TableCell>
                  <TableCell align="right">
                    <a
                      href={getEtherscanUrl(liquidation.liquidationReceipt)}
                      target="_blank"
                    >
                      {prettyAddress(liquidation.liquidationReceipt)}
                    </a>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {liquidation.liquidator && (
                      <a
                        href={getEtherscanUrl(liquidation.liquidator)}
                        target="_blank"
                      >
                        {prettyAddress(liquidation.liquidator)}
                      </a>
                    )}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {liquidation.disputer && (
                      <a
                        href={getEtherscanUrl(liquidation.disputer)}
                        target="_blank"
                      >
                        {prettyAddress(liquidation.disputer)}
                      </a>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {liquidation.liquidationId}
                  </TableCell>
                  <TableCell align="right">{liquidation.status}</TableCell>
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

export default AllLiquidations;
