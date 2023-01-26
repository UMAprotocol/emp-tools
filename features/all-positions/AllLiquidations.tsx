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
import LiquidationActionDialog from "./LiquidationActionDialog";

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
  MAX_DISPUTABLE_PRICE,
  LOCKED_COLLATERAL,
  TOKENS_LIQUIDATED,
  LIQUIDATION_TIMESTAMP,
}

const FIELD_TO_VALUE: { [sortField: number]: string } = {
  [SORT_FIELD.MAX_DISPUTABLE_PRICE]: "maxDisputablePrice",
  [SORT_FIELD.LOCKED_COLLATERAL]: "lockedCollateral",
  [SORT_FIELD.TOKENS_LIQUIDATED]: "tokensLiquidated",
  [SORT_FIELD.LIQUIDATION_TIMESTAMP]: "liquidationTimestamp",
};

const ITEMS_PER_PAGE = 10;

const AllLiquidations = () => {
  const { empState } = EmpState.useContainer();
  const { priceIdentifier: priceId, liquidationLiveness } = empState;
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

  // Extra info dialog
  const [isDialogShowing, setIsDialogShowing] = useState<boolean>(false);
  const [sponsorPlusId, setSponsorPlusId] = useState<string | null>(null);

  // Set max page depending on # of liqs
  useEffect(() => {
    setMaxPage(1);
    setPage(1);

    if (liquidations) {
      const extraPages =
        Object.keys(liquidations).length % ITEMS_PER_PAGE === 0 ? 0 : 1;
      setMaxPage(
        Math.floor(Object.keys(liquidations).length / ITEMS_PER_PAGE) +
          extraPages
      );
    }
  }, [liquidations]);

  if (
    tokenSymbol !== null &&
    collSymbol !== null &&
    priceId !== null &&
    liquidations &&
    liquidationLiveness !== null &&
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
      return x.substr(0, 5) + "..." + x.substr(x.length - 5, x.length);
    };

    // Checkbox for liquidated positions
    const handleOpenActionsDialog = (id: string) => {
      setSponsorPlusId(id);
      setIsDialogShowing(true);
    };

    const invertDisputablePrice = isPricefeedInvertedFromTokenSymbol(
      tokenSymbol
    );
    const getDisputablePrice = (x: string) => {
      return invertDisputablePrice && parseFloat(x) !== 0
        ? 1 / Number(x)
        : Number(x);
    };

    const translateLiquidationStatus = (
      liquidationTimestamp: number,
      liquidationStatus: string
    ) => {
      const liquidationTimeRemaining =
        liquidationTimestamp +
        liquidationLiveness.toNumber() -
        Math.floor(Date.now() / 1000);
      if (liquidationTimeRemaining > 0 && liquidationStatus === "PreDispute") {
        return "Liquidation Pending";
      } else if (
        liquidationTimeRemaining <= 0 &&
        liquidationStatus === "PreDispute"
      ) {
        return "Liquidation Succeeded";
      } else if (liquidationStatus === "PendingDispute") {
        return "Dispute Pending";
      } else if (liquidationStatus === "DisputeSucceeded") {
        return "Dispute Succeeded";
      } else if (liquidationStatus === "DisputeFailed") {
        return "Dispute Failed";
      } else {
        return "Unknown";
      }
    };

    // First filters out liq. data missing field values,
    // then sorts the positions according to selected sort column,
    // and finally slices the array based on pagination selection.
    const reformattedLiquidationData = Object.keys(liquidations)
      .filter((sponsorPlusId: string) => {
        return (
          liquidations[sponsorPlusId]?.maxDisputablePrice &&
          liquidations[sponsorPlusId]?.tokensLiquidated &&
          liquidations[sponsorPlusId]?.lockedCollateral &&
          liquidations[sponsorPlusId]?.liquidationTimestamp
        );
      })
      .sort((sponsorPlusIdA: string, sponsorPlusIdB: string) => {
        const fieldValueA =
          liquidations[sponsorPlusIdA][FIELD_TO_VALUE[sortedColumn]];
        const fieldValueB =
          liquidations[sponsorPlusIdB][FIELD_TO_VALUE[sortedColumn]];
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
                    <br />
                    Address
                  </strong>
                </TableCell>
                <TableCell align="right">
                  <strong>
                    <SortableTableColumnHeader
                      sortField={SORT_FIELD.LIQUIDATION_TIMESTAMP}
                    >
                      Liquidation Timestamp{" "}
                    </SortableTableColumnHeader>
                  </strong>
                </TableCell>
                <TableCell align="right">
                  <strong>
                    Liquidation
                    <br />
                    Status{" "}
                  </strong>
                </TableCell>
                <TableCell align="right">
                  <strong>
                    <SortableTableColumnHeader
                      sortField={SORT_FIELD.LOCKED_COLLATERAL}
                    >
                      Locked
                      <br /> Collateral
                      <br />({collSymbol}){" "}
                    </SortableTableColumnHeader>
                  </strong>
                </TableCell>
                <TableCell align="right" style={{ width: "100%" }}>
                  <strong>
                    <SortableTableColumnHeader
                      sortField={SORT_FIELD.TOKENS_LIQUIDATED}
                    >
                      Liquidated <br />
                      Synthetics
                      <br />({tokenSymbol}){" "}
                    </SortableTableColumnHeader>
                  </strong>
                </TableCell>
                <Tooltip
                  title={`If the index price at the liquidation timestamp was ${
                    invertDisputablePrice ? `above` : `below`
                  } this, then the liquidation would be disputable.`}
                  placement="top"
                >
                  <TableCell align="right">
                    <strong>
                      <SortableTableColumnHeader
                        sortField={SORT_FIELD.MAX_DISPUTABLE_PRICE}
                      >
                        {invertDisputablePrice ? `Minimum` : `Maximum`}{" "}
                        Disputable Price{" "}
                      </SortableTableColumnHeader>
                    </strong>
                  </TableCell>
                </Tooltip>

                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reformattedLiquidationData.map((id: string) => {
                const liquidation = liquidations[id];
                return (
                  <StyledTableRow key={id}>
                    <TableCell component="th" scope="row">
                      <a
                        href={getEtherscanUrl(liquidation.sponsor)}
                        target="_blank"
                      >
                        {prettyAddress(liquidation.sponsor)}
                      </a>
                    </TableCell>
                    <TableCell align="left">
                      {prettyDate(Number(liquidation.liquidationTimestamp))}
                    </TableCell>
                    <TableCell align="right">
                      {translateLiquidationStatus(
                        Number(liquidation.liquidationTimestamp),
                        liquidation.status
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {prettyBalance(Number(liquidation.lockedCollateral))}
                    </TableCell>
                    <TableCell align="right">
                      {prettyBalance(Number(liquidation.tokensLiquidated))}
                    </TableCell>
                    <TableCell align="right">
                      {prettyBalance(
                        getDisputablePrice(liquidation.maxDisputablePrice)
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <MoreInfo onClick={() => handleOpenActionsDialog(id)}>
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
        <LiquidationActionDialog
          handleClose={() => setIsDialogShowing(!isDialogShowing)}
          isDialogShowing={isDialogShowing}
          sponsorPlusId={sponsorPlusId}
        />
      </div>
    );
  } else {
    return <></>;
  }
};

export default AllLiquidations;
