import styled from "styled-components";
import { utils } from "ethers";
const { formatUnits: fromWei } = utils;
import { useState } from "react";

import {
  Box,
  Container,
  Typography,
  Dialog,
  Button,
  Tooltip,
} from "@material-ui/core";

import EmpState from "../../containers/EmpState";
import OoState from "../../containers/OoState";
import Token from "../../containers/Token";
import EmpSponsors from "../../containers/EmpSponsors";
import EmpContract from "../../containers/EmpContract";
import Collateral from "../../containers/Collateral";
import Etherscan from "../../containers/Etherscan";

import { DOCS_MAP } from "../../constants/docLinks";
import { isPricefeedInvertedFromTokenSymbol } from "../../utils/getOffchainPrice";

const Label = styled.span`
  color: #999999;
`;

const Status = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PositionDialog = styled.div`
  width: 100%;
  border-color: white;
  padding-left: 15px;
  padding-right: 15px;
  padding-bottom: 20px;
`;

const Important = styled(Typography)`
  color: red;
  background: black;
  display: inline-block;
`;

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

interface DialogProps {
  handleClose(): any;
  isDialogShowing: boolean;
  sponsorPlusId: string | null;
}

const LiquidationActionDialog = (props: DialogProps) => {
  const { empState } = EmpState.useContainer();
  const { ooState } = OoState.useContainer();
  const { finalFee } = ooState;
  const { getEtherscanUrl } = Etherscan.useContainer();
  const { contract: emp } = EmpContract.useContainer();

  const { symbol: tokenSymbol } = Token.useContainer();
  const {
    symbol: collSymbol,
    balance: collBalance,
    allowance: collAllowance,
    setMaxAllowance: setMaxCollateralAllowance,
  } = Collateral.useContainer();
  const { liquidations } = EmpSponsors.useContainer();

  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const {
    disputeBondPct,
    priceIdentifierUtf8,
    liquidationLiveness,
    withdrawalLiveness,
    currentTime,
    isExpired,
  } = empState;

  const prettyBalance = (x: number) => {
    const x_string = x.toFixed(8);
    return utils.commify(x_string);
  };

  const prettyAddress = (x: String = "") => {
    return x.substr(0, 6) + "..." + x.substr(x.length - 6, x.length);
  };

  if (
    emp !== null &&
    liquidations !== null &&
    props.sponsorPlusId !== null &&
    liquidations[props.sponsorPlusId] &&
    liquidations[props.sponsorPlusId] !== null &&
    isExpired !== null &&
    priceIdentifierUtf8 !== null &&
    disputeBondPct !== null &&
    collAllowance !== null &&
    collBalance !== null &&
    collSymbol !== null &&
    liquidationLiveness !== null &&
    withdrawalLiveness !== null &&
    currentTime !== null &&
    tokenSymbol !== null &&
    finalFee !== null
  ) {
    const liquidatedPosition = liquidations[props.sponsorPlusId];
    const invertDisputablePrice = isPricefeedInvertedFromTokenSymbol(
      tokenSymbol
    );
    const needCollateralAllowance = () => {
      if (collAllowance === "Infinity") return false;
      return collAllowance < finalFee;
    };

    const requiredDisputeBond =
      Number(fromWei(disputeBondPct)) *
      Number(liquidatedPosition.lockedCollateral);
    const collRequired = finalFee + requiredDisputeBond;
    const collBalanceTooLow = collBalance < collRequired;

    const liquidationTimeRemaining =
      Number(liquidatedPosition.liquidationTimestamp) +
      Number(liquidationLiveness) -
      Number(currentTime);

    const pendingLiquidationTimeString =
      liquidationTimeRemaining > 0
        ? Math.max(0, Math.floor(liquidationTimeRemaining / 3600)) +
          ":" +
          Math.max(0, Math.floor((liquidationTimeRemaining % 3600) / 60)) +
          ":" +
          Math.max(0, (liquidationTimeRemaining % 3600) % 60)
        : "None";

    const translateLiquidationStatus = (
      liquidationTimestamp: number,
      liquidationStatus: string
    ) => {
      const liquidationTimeRemaining =
        liquidationTimestamp +
        liquidationLiveness.toNumber() -
        Math.floor(Date.now() / 1000);
      if (liquidationTimeRemaining > 0 && liquidationStatus === "PreDispute") {
        return {
          status: "Liquidation Pending",
          description:
            "The liquidation is currently pending for the liveness period. The liquidation can be disputed during this time.",
        };
      } else if (
        liquidationTimeRemaining <= 0 &&
        liquidationStatus === "PreDispute"
      ) {
        return {
          status: "Liquidation Succeeded",
          description:
            "The liquidation passed the liquidation liveness period undisputed.",
        };
      } else if (liquidationStatus === "PendingDispute") {
        return {
          status: "Dispute Pending",
          description:
            "The liquidation was disputed and will be resolved once the DVM returns a resolution price.",
        };
      } else if (liquidationStatus === "DisputeSucceeded") {
        return {
          status: "Dispute Succeeded",
          description:
            "The liquidation was disputed and the DVM resolved price made the liquidation invalid(valid dispute).",
        };
      } else if (liquidationStatus === "DisputeFailed") {
        return {
          status: "Dispute Failed",
          description:
            "The liquidation was disputed and the DVM resolved price made the liquidation valid (invalid dispute).",
        };
      } else {
        return { status: "Unknown", description: "" };
      }
    };

    const prettyDate = (x_secs: number) => {
      return new Date(x_secs * 1000).toLocaleString("en-GB", {
        timeZone: "UTC",
      });
    };

    const getDisputablePrice = (x: string) => {
      return invertDisputablePrice && parseFloat(x) !== 0
        ? 1 / Number(x)
        : Number(x);
    };

    const executeDispute = async () => {
      if (!collBalanceTooLow) {
        setHash(null);
        setSuccess(null);
        setError(null);

        try {
          if (needCollateralAllowance()) await setMaxCollateralAllowance();
          const tx = await emp.dispute(
            liquidatedPosition.liquidationId,
            liquidatedPosition.sponsor
          );
          setHash(tx.hash as string);
          await tx.wait();

          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setError(new Error("Please check that you are connected."));
      }
    };

    return (
      <Dialog open={props.isDialogShowing} onClose={props.handleClose}>
        <PositionDialog>
          <Container>
            <Box>
              <Box>
                <h1>Liquidation Info & Actions</h1>
                <Status>
                  <Label>Liquidation status: </Label>
                  <Tooltip
                    title={
                      translateLiquidationStatus(
                        Number(liquidatedPosition.liquidationTimestamp),
                        liquidatedPosition.status
                      ).description
                    }
                    placement="top"
                  >
                    <span>
                      {" "}
                      {
                        translateLiquidationStatus(
                          Number(liquidatedPosition.liquidationTimestamp),
                          liquidatedPosition.status
                        ).status
                      }
                    </span>
                  </Tooltip>
                </Status>
                <Status>
                  <Label>Liquidation Timestamp (UTC): </Label>
                  <Tooltip
                    title={`Liquidation occurred at unix timestamp: ${liquidatedPosition.liquidationTimestamp}`}
                    placement="top"
                  >
                    <span>
                      {prettyDate(
                        Number(liquidatedPosition.liquidationTimestamp)
                      )}
                    </span>
                  </Tooltip>
                </Status>
                {pendingLiquidationTimeString !== "None" && (
                  <Status>
                    <Label>Liquidation liveness remaining: </Label>
                    <Tooltip
                      title={
                        "Time remaining for the liquidation to be disputed. After this time no dispute requests can be made."
                      }
                      placement="top"
                    >
                      <span>{pendingLiquidationTimeString}</span>
                    </Tooltip>
                  </Status>
                )}
                <Status>
                  <Label>Liquidation Transaction: </Label>
                  <a
                    href={getEtherscanUrl(
                      liquidatedPosition.liquidationReceipt
                    )}
                    target="_blank"
                  >
                    {prettyAddress(liquidatedPosition.liquidationReceipt || "")}
                  </a>
                </Status>
                <Status>
                  <Label>Sponsor: </Label>
                  <a
                    href={getEtherscanUrl(liquidatedPosition.sponsor)}
                    target="_blank"
                  >
                    {prettyAddress(liquidatedPosition.sponsor || "")}
                  </a>
                </Status>
                <Status>
                  <Label>Liquidator: </Label>
                  <a
                    href={getEtherscanUrl(liquidatedPosition.liquidator)}
                    target="_blank"
                  >
                    {prettyAddress(liquidatedPosition.liquidator || "")}
                  </a>
                </Status>
                <Status>
                  <Label>Disputer: </Label>
                  {liquidatedPosition.disputer && (
                    <a
                      href={getEtherscanUrl(liquidatedPosition.disputer)}
                      target="_blank"
                    >
                      {prettyAddress(liquidatedPosition.disputer || "")}
                    </a>
                  )}
                  {!liquidatedPosition.disputer && (
                    <span>None(undisputed)</span>
                  )}
                </Status>
                <Status>
                  <Label>Liquidation ID: </Label>
                  {liquidatedPosition.liquidationId}
                </Status>
                <Status>
                  <Label>Tokens liquidated: </Label>
                  {prettyBalance(
                    Number(liquidatedPosition.tokensLiquidated)
                  )}{" "}
                  {tokenSymbol}
                </Status>
                <Status>
                  <Label>Locked Collateral: </Label>
                  {prettyBalance(
                    Number(liquidatedPosition.lockedCollateral)
                  )}{" "}
                  {collSymbol}
                </Status>
                <Status>
                  <Tooltip
                    title={
                      "Equal to the locked collateral minus any requested withdrawal amount"
                    }
                    placement="top"
                  >
                    <Label>Backing Collateral: </Label>
                  </Tooltip>
                  {prettyBalance(
                    Number(liquidatedPosition.liquidatedCollateral)
                  )}{" "}
                  {collSymbol}
                </Status>
                <Status>
                  <Label>
                    {invertDisputablePrice ? `Minimum` : `Maximum`} Disputable
                    Price:{" "}
                  </Label>

                  {prettyBalance(
                    getDisputablePrice(liquidatedPosition.maxDisputablePrice)
                  )}
                </Status>
                {!isExpired && (
                  <Box pt={2}>
                    <hr />
                    <Typography>
                      <strong>Dispute this liquidation</strong>
                      <br></br>
                    </Typography>
                    {translateLiquidationStatus(
                      Number(liquidatedPosition.liquidationTimestamp),
                      liquidatedPosition.status
                    ).status !== "Liquidation Pending" && (
                      <span>
                        <Typography>
                          This liquidation can't be disputed because the
                          liveness period to file a dispute has passed.
                        </Typography>
                        <Box textAlign="center" pt={3} pb={2}>
                          <Button fullWidth variant="contained" disabled>
                            Dispute Liquidation
                          </Button>
                        </Box>
                      </span>
                    )}
                    {translateLiquidationStatus(
                      Number(liquidatedPosition.liquidationTimestamp),
                      liquidatedPosition.status
                    ).status === "Liquidation Pending" && (
                      <span>
                        <Typography>
                          This liquidation is currently in it's liveness period
                          and can be disputed if you think it was invalid. In
                          order for this liquidation to be invalid, the
                          identifier {priceIdentifierUtf8} would need to be{" "}
                          {invertDisputablePrice ? "less" : "greater"} than{" "}
                          {prettyBalance(
                            Number(liquidatedPosition.maxDisputablePrice)
                          )}{" "}
                          at the time of liquidation.
                          <br></br>
                          <br></br>
                          To dispute this liquidation you will need to post a
                          dispute bond of{" "}
                          {Number(fromWei(disputeBondPct)) * 100}% of the
                          collateral liquidated, equalling{" "}
                          {prettyBalance(requiredDisputeBond)} {collSymbol}.
                          Additionally, you will need to pay the final fee of{" "}
                          {finalFee} {collSymbol}.<br></br>
                          <br></br>
                        </Typography>
                        <Important>
                          Exercise caution! An incorrect dispute will lose you
                          the dispute bond AND final fee! See the{" "}
                          <a
                            href={DOCS_MAP.FINAL_FEE}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            UMA docs
                          </a>
                          .
                        </Important>
                        <Box textAlign="center" pt={3} pb={2}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={executeDispute}
                            disabled={collBalanceTooLow}
                          >{`Dispute Liquidation`}</Button>
                        </Box>
                        {needCollateralAllowance() && !collBalanceTooLow && (
                          <Typography>
                            Note you will need to sign two transactions one to
                            approve {collSymbol} to pay the DVM final fee and
                            post the dispute bond and a second to perform the
                            dispute.
                          </Typography>
                        )}
                        {collBalanceTooLow && (
                          <Typography>
                            Your wallet does not have enough collateral to pay
                            the dispute bond and DVM final fee! You need, at
                            minimum, {prettyBalance(collRequired)} {collSymbol}{" "}
                            to perform this dispute.
                          </Typography>
                        )}
                      </span>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
            {hash && (
              <Box py={2}>
                <Typography>
                  <strong>Tx Receipt: </strong>
                  {hash ? (
                    <Link
                      href={getEtherscanUrl(hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {hash}
                    </Link>
                  ) : (
                    hash
                  )}
                </Typography>
              </Box>
            )}
            {success && (
              <Box py={2}>
                <Typography>
                  <strong>Transaction successful!</strong>
                </Typography>
              </Box>
            )}
            {error && (
              <Box pt={2}>
                <Typography>
                  <span style={{ color: "red" }}>{error.message}</span>
                </Typography>
              </Box>
            )}
          </Container>
        </PositionDialog>
      </Dialog>
    );
  } else {
    return <Box></Box>;
  }
};

export default LiquidationActionDialog;
