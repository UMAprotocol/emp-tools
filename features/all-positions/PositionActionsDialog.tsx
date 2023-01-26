import styled from "styled-components";
import { ethers, utils } from "ethers";
const { formatUnits: fromWei } = utils;
import { useState, MouseEvent, useEffect } from "react";
import Alert from "@material-ui/lab/Alert";

import {
  Box,
  Grid,
  Container,
  Typography,
  Dialog,
  Button,
  TextField,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  Tooltip,
} from "@material-ui/core";

import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

import EmpState from "../../containers/EmpState";
import OoState from "../../containers/OoState";
import Token from "../../containers/Token";
import EmpSponsors from "../../containers/EmpSponsors";
import EmpContract from "../../containers/EmpContract";
import Collateral from "../../containers/Collateral";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";
import Connection from "../../containers/Connection";

import { DOCS_MAP } from "../../constants/docLinks";
import { toWeiSafe } from "../../utils/convertToWeiSafely";

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
  selectedSponsor: string | null;
}

const PositionActionsDialog = (props: DialogProps) => {
  const { empState } = EmpState.useContainer();
  const {
    priceIdentifierUtf8,
    collateralRequirement: collReq,
    currentTime,
    isExpired,
  } = empState;
  const { ooState } = OoState.useContainer();
  const { finalFee } = ooState;
  const { getEtherscanUrl } = Etherscan.useContainer();
  const { contract: emp } = EmpContract.useContainer();
  const { latestPrice } = PriceFeed.useContainer();
  const {
    symbol: tokenSymbol,
    balance: tokenBalance,
    decimals: tokenDecs,
    allowance: tokenAllowance,
    setMaxAllowance: setMaxTokenAllowance,
  } = Token.useContainer();
  const {
    symbol: collSymbol,
    balance: collBalance,
    decimals: collDecs,
    allowance: collAllowance,
    setMaxAllowance: setMaxCollateralAllowance,
  } = Collateral.useContainer();
  const { activeSponsors } = EmpSponsors.useContainer();
  const { address: connectedWalletAddress } = Connection.useContainer();

  const [tabIndex, setTabIndex] = useState<string>("deposit");
  const [collateralToDeposit, setCollateralToDeposit] = useState<string>("");

  const [
    minCollPerTokenToBeProfitable,
    setMinCollPerTokenToBeProfitable,
  ] = useState<string>("");
  const [maxCollPerTokenToBeValid, setMaxCollPerTokenToBeValid] = useState<
    string
  >("");
  const [minCollPerToken, setMinCollPerToken] = useState<string>("");
  const [maxCollPerToken, setMaxCollPerToken] = useState<string>("");
  const [maxTokensToLiquidate, setMaxTokensToLiquidate] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");

  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (
      props.selectedSponsor !== null &&
      latestPrice !== null &&
      collReq !== null &&
      tokenBalance !== null
    ) {
      const sponsorPosition = activeSponsors[props.selectedSponsor];

      // Set smart min and max collPerToken params for the Liquidation.
      // - min collPerToken should be the point at which you'll lose money on the liquidation
      //   (i.e. when locked collateral in the position is = 100% of the token debt).
      //   Since the liquidator must "burn" tokens to liquidate and withdraw collateral,
      //   the amount of backing collateral in the position must be >= 100% of the token debt.
      //   Therefore, the minimum `collPerToken` is simply the current price of 1 unit token debt,
      //   which is the `latestPrice`.
      // - max collPerToken should be point at which the liquidation is invalid
      //   (i.e. equal to the coll requirement).
      //   The maximum amount of backing collateral in the position for it to be liquidatable
      //   is 1.25 x the current price of the token debt, which simplifies to 1.25 `latestPrice`.
      // - (TODO) If the current ratio of backing collateral to token debt is < `minCollPerToken`
      //   or > `maxCollPerToken`, then the user shouldn't be liquidating the position.
      //   Perhaps we should block this functionality in this situation.
      const _minCollPerTokenToBeProfitable = latestPrice;
      const _maxCollPerTokenToBeValid =
        latestPrice * parseFloat(fromWei(collReq));

      setMinCollPerTokenToBeProfitable(
        _minCollPerTokenToBeProfitable.toFixed(10)
      );
      setMaxCollPerTokenToBeValid(_maxCollPerTokenToBeValid.toFixed(10));

      // Only autofill these if they are empty
      if (minCollPerToken === "") {
        setMinCollPerToken(_minCollPerTokenToBeProfitable.toFixed(10));
      }
      if (maxCollPerToken === "") {
        setMaxCollPerToken(_maxCollPerTokenToBeValid.toFixed(10));
      }

      // Set max tokens to liquidate as full position size.
      if (maxTokensToLiquidate === "") {
        setMaxTokensToLiquidate(
          Math.min(
            Number(sponsorPosition.tokensOutstanding),
            tokenBalance
          ).toString()
        );
      }
    }

    // Set liquidation transaction deadline to a reasonable 30 mins to wait for it to be mined.
    setDeadline((30 * 60).toString());
  }, [props.selectedSponsor, latestPrice, collReq, tokenBalance]);

  const setDialogTab = (
    event: MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    if (newAlignment) {
      setTabIndex(newAlignment);
    }
  };

  const prettyBalance = (x: number) => {
    const x_string = x.toFixed(4);
    return utils.commify(x_string);
  };

  const prettyAddress = (x: String) => {
    return x.substr(0, 6) + "..." + x.substr(x.length - 6, x.length);
  };

  if (
    activeSponsors !== null &&
    props.selectedSponsor !== null &&
    activeSponsors[props.selectedSponsor] &&
    activeSponsors[props.selectedSponsor] !== null &&
    isExpired !== null &&
    latestPrice !== null &&
    collReq !== null &&
    emp !== null &&
    currentTime !== null &&
    finalFee !== null &&
    tokenSymbol !== null &&
    tokenDecs !== null &&
    tokenBalance !== null &&
    tokenAllowance !== null &&
    collSymbol !== null &&
    collDecs !== null &&
    collBalance !== null &&
    collAllowance !== null &&
    priceIdentifierUtf8 !== null
  ) {
    const minCollPerTokenNum = Number(minCollPerToken) || 0;
    const maxCollPerTokenNum = Number(maxCollPerToken) || 0;
    const minCollPerTokeToBeProfitablenNum =
      Number(minCollPerTokenToBeProfitable) || 0;
    const maxCollPerTokenToBeValidNum = Number(maxCollPerTokenToBeValid) || 0;

    const sponsorPosition = activeSponsors[props.selectedSponsor];

    const collateralToDepositNum = Number(collateralToDeposit) || 0;
    const maxTokensToLiquidateNum = Number(maxTokensToLiquidate) || 0;

    const pendingWithdrawTimeRemaining =
      Number(sponsorPosition.withdrawalTimestamp) - Number(currentTime);
    const pendingTransferTimeRemaining =
      Number(sponsorPosition.TransferTimestamp) - Number(currentTime);

    const prettyTimeRemaining = (timeRemaining: number) => {
      return timeRemaining > 0
        ? Math.max(0, Math.floor(timeRemaining / 3600)) +
            ":" +
            Math.max(0, Math.floor((timeRemaining % 3600) / 60)) +
            ":" +
            Math.max(0, (timeRemaining % 3600) % 60)
        : "None";
    };
    const pendingTransferTimeString = prettyTimeRemaining(
      pendingTransferTimeRemaining
    );
    const pendingWithdrawTimeString = prettyTimeRemaining(
      pendingWithdrawTimeRemaining
    );

    const collRatio =
      Number(sponsorPosition.collateral) === 0 ||
      Number(sponsorPosition.tokensOutstanding) === 0
        ? 0
        : Number(sponsorPosition.collateral) /
          Number(sponsorPosition.tokensOutstanding);
    const underCollateralizedPrice =
      collRatio === 0 || Number(collReq) === 0
        ? 0
        : collRatio / parseFloat(fromWei(collReq));

    const underCollateralizedPercent =
      Number(latestPrice) === 0
        ? 0
        : ((Number(latestPrice) - Number(underCollateralizedPrice)) /
            Number(latestPrice)) *
          100;

    const collBalanceTooLow = () => {
      if (tabIndex == "deposit") {
        return collBalance < collateralToDepositNum;
      }
      if (tabIndex == "liquidate") {
        return collBalance < finalFee;
      }
    };

    const tokenBalanceTooLow = tokenBalance < maxTokensToLiquidateNum;
    const positionTokensOutstanding =
      Number(sponsorPosition.tokensOutstanding) || 0;
    const tokensToLiquidateInvalid =
      maxTokensToLiquidateNum > positionTokensOutstanding;

    const needCollateralAllowance = () => {
      if (tabIndex == "deposit") {
        if (collAllowance === "Infinity") return false;
        return collAllowance < collateralToDepositNum;
      }
      if (tabIndex == "liquidate") {
        if (collAllowance === "Infinity") return false;
        return collAllowance < finalFee;
      }
      return true;
    };
    const needTokenAllowance = () => {
      if (tokenAllowance === "Infinity") return false;
      return tokenAllowance < maxTokensToLiquidateNum;
    };

    // Liquidation requires both collateral and synthetic to be approved. This
    // results in a number of different configurations the user could be in depending
    // on their interaction with this Dapp. Process the text here to keep the
    // component simple.
    const liquidationNeedAllowanceText = () => {
      if (!needCollateralAllowance() && !needTokenAllowance()) {
        return "";
      }
      if (needCollateralAllowance() && !needTokenAllowance()) {
        return `You will need to sign two transactions, one to approve collateral ${collSymbol} and a second to preform the liquidation.`;
      }
      if (!needCollateralAllowance() && needTokenAllowance()) {
        return `You will need to sign two transactions one to approve synthetic ${tokenSymbol} and a second to preform the liquidation.`;
      }
      if (needCollateralAllowance() && needTokenAllowance()) {
        return `You will need to sign three transactions, one to approve synthetic ${tokenSymbol}, one to approve collateral ${collSymbol} and a third to preform the liquidation.`;
      }
    };

    const executeDeposit = async () => {
      if (!collBalanceTooLow()) {
        setHash(null);
        setSuccess(null);
        setError(null);
        const collateralToDepositWei = toWeiSafe(collateralToDeposit, collDecs);

        try {
          if (needCollateralAllowance()) await setMaxCollateralAllowance();
          const tx = await emp.depositTo(props.selectedSponsor, [
            collateralToDepositWei,
          ]);
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

    const executeLiquidation = async () => {
      if (
        !collBalanceTooLow() &&
        !tokenBalanceTooLow &&
        !tokensToLiquidateInvalid
      ) {
        setHash(null);
        setSuccess(null);
        setError(null);
        const minCollPerTokenWei = toWeiSafe(minCollPerToken, collDecs);
        const maxCollPerTokenWei = toWeiSafe(maxCollPerToken, collDecs);
        const maxTokensToLiquidateWei = toWeiSafe(
          maxTokensToLiquidate,
          tokenDecs
        );
        const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadline;
        try {
          if (needCollateralAllowance()) await setMaxCollateralAllowance();
          if (needTokenAllowance()) await setMaxTokenAllowance();

          const tx = await emp.createLiquidation(
            props.selectedSponsor,
            [minCollPerTokenWei],
            [maxCollPerTokenWei],
            [maxTokensToLiquidateWei],
            deadlineTimestamp
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
              <Box pb={2}>
                <h1>Position Info & Actions</h1>
                <Status>
                  <Label>Sponsor: </Label>
                  <a
                    href={getEtherscanUrl(props.selectedSponsor)}
                    target="_blank"
                  >
                    {prettyAddress(props.selectedSponsor)}
                  </a>
                </Status>
                <Status>
                  <Label>Position Collateral({collSymbol}): </Label>
                  {prettyBalance(Number(sponsorPosition.collateral))}
                </Status>
                <Status>
                  <Tooltip
                    title={
                      "Equal to the position collateral minus any requested withdrawal amount"
                    }
                    placement="top"
                  >
                    <Label>Backing Collateral({collSymbol}): </Label>
                  </Tooltip>
                  {prettyBalance(Number(sponsorPosition.backingCollateral))}
                </Status>
                <Status>
                  <Label>Minted Synthetics({tokenSymbol}): </Label>
                  {prettyBalance(Number(sponsorPosition.tokensOutstanding))}
                </Status>
                <Status>
                  <Label>Collateral Ratio: </Label>
                  {prettyBalance(Number(sponsorPosition.cRatio))}
                </Status>
                <Status>
                  <Label>Pending Withdrawal: </Label>
                  {sponsorPosition.pendingWithdraw}
                </Status>
                {sponsorPosition.pendingWithdraw !== "No" && (
                  <div>
                    <Status>
                      <Label>Withdraw liveness time remaining: </Label>
                      {pendingWithdrawTimeString}
                    </Status>
                    <Status>
                      <Label>Withdraw request amount: </Label>
                      {prettyBalance(
                        Number(sponsorPosition.withdrawalRequestAmount)
                      )}{" "}
                      {collSymbol}
                    </Status>
                  </div>
                )}
                <Status>
                  <Label>Pending Transfer: </Label>
                  {sponsorPosition.pendingTransfer}
                </Status>
                {sponsorPosition.pendingTransfer !== "No" && (
                  <Status>
                    <Label>Transfer liveness time remaining: </Label>
                    {pendingTransferTimeString}
                  </Status>
                )}
                <Status>
                  <Label>Collateral Ratio: </Label>
                  {Number(sponsorPosition.cRatio).toFixed(4)}
                </Status>
                <Status>
                  <Label>Liquidation Price: </Label>
                  {Number(sponsorPosition.liquidationPrice).toFixed(4)}
                </Status>
              </Box>
              {!isExpired && (
                <Box>
                  <hr />
                  <Box pt={2} textAlign="center">
                    <ToggleButtonGroup
                      value={tabIndex}
                      exclusive
                      onChange={setDialogTab}
                    >
                      <ToggleButton value="deposit">deposit</ToggleButton>
                      <ToggleButton value="liquidate">liquidate</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <Box pt={2}>
                    {tabIndex === "deposit" && (
                      <Box>
                        {connectedWalletAddress?.toLowerCase() !==
                          props.selectedSponsor?.toLowerCase() && (
                          <Box pt={2} pb={3}>
                            <Alert severity="warning">
                              Make sure you control the sponsor address{" "}
                              <a
                                href={getEtherscanUrl(props.selectedSponsor)}
                                target="_blank"
                              >
                                {prettyAddress(props.selectedSponsor)}
                              </a>{" "}
                              before depositing. Otherwise, you will lose your
                              deposit.
                            </Alert>
                          </Box>
                        )}
                        <Typography>
                          <strong>
                            Deposit collateral into this sponsor's position
                          </strong>
                          <br></br>
                          You can add additional collateral to this position,
                          even if it's not yours.
                        </Typography>
                        <Box pt={2}>
                          <Grid container spacing={4}>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                type="number"
                                inputProps={{ min: "0" }}
                                label={`Collateral (${collSymbol})`}
                                error={collBalanceTooLow()}
                                helperText={
                                  collBalanceTooLow()
                                    ? `${collSymbol} balance too low`
                                    : null
                                }
                                value={collateralToDeposit}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => setCollateralToDeposit(e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Box py={2}>
                                {collateralToDeposit &&
                                collateralToDeposit != "0" &&
                                !collBalanceTooLow() ? (
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={executeDeposit}
                                  >{`Deposit ${collateralToDeposit} ${collSymbol} into the position`}</Button>
                                ) : (
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    disabled
                                  >
                                    Deposit
                                  </Button>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                          {needCollateralAllowance() && (
                            <Typography>
                              <br></br>
                              <strong>Note:</strong> You will need to sign two
                              transactions one to approve {collSymbol} and a
                              second to perform the deposit.
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                    {tabIndex === "liquidate" && (
                      <Box pt={2}>
                        <Typography component={"span"}>
                          <strong>Liquidate this sponsor</strong>
                          <br></br>For the position to be under collateralized{" "}
                          {priceIdentifierUtf8} would need to{" "}
                          {underCollateralizedPrice > latestPrice
                            ? "increase"
                            : "decrease"}{" "}
                          by {Math.abs(underCollateralizedPercent).toFixed(4)}%
                          from {latestPrice.toFixed(8)} to{" "}
                          {underCollateralizedPrice.toFixed(8)}. You can still
                          liquidate this position if you have a different
                          opinion on the {priceIdentifierUtf8} price.
                          <br></br>
                          <br></br>
                          <Tooltip
                            placement="top"
                            title={`This can be calculated as (amount of collateral) divided by 
                              (amount of tokens).`}
                          >
                            <Status>
                              <Label>Current collateral/token ratio: </Label>
                              {collRatio.toFixed(4)}
                            </Status>
                          </Tooltip>
                          <Tooltip
                            placement="top"
                            title={`Liquidating a position whose collateral ratio is
                              below ${minCollPerTokenToBeProfitable} would not be
                              profitable using the estimated 
                              ${priceIdentifierUtf8} price. This is
                              because you must burn synthetic tokens in order to
                              liquidate underlying collateral, and we estimate
                              that each ${tokenSymbol} is worth
                              ${latestPrice.toFixed(4)} of the collateral
                              ${collSymbol}.`}
                          >
                            <Status>
                              <Label>Minimum profitable ratio: </Label>
                              {minCollPerTokenToBeProfitable}
                            </Status>
                          </Tooltip>
                          <Tooltip
                            placement="top"
                            title={`Liquidating a position whose collateral ratio is
                              greater than ${maxCollPerTokenToBeValid} would get
                              disputed using the estimated
                              ${priceIdentifierUtf8} price of 
                              ${latestPrice.toFixed(4)} and the collateral
                              requirement of ${parseFloat(fromWei(collReq))}.`}
                          >
                            <Status>
                              <Label>Maximum liquidatable ratio: </Label>
                              {maxCollPerTokenToBeValid}
                            </Status>
                          </Tooltip>
                        </Typography>
                        {minCollPerTokenNum <
                          minCollPerTokeToBeProfitablenNum && (
                          <>
                            <br></br>
                            <br></br>
                            <Important>
                              Liquidating a position whose collateral ratio is
                              below {minCollPerTokenToBeProfitable} would not be
                              profitable using the estimated{" "}
                              {priceIdentifierUtf8} price. This is because you
                              must burn synthetic tokens in order to liquidate
                              underlying collateral, and we estimate that each{" "}
                              {tokenSymbol} is worth {latestPrice.toFixed(4)} of
                              the collateral {collSymbol}. See the{" "}
                              <a
                                href={DOCS_MAP.FINAL_FEE}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                UMA docs
                              </a>
                              .
                            </Important>
                          </>
                        )}
                        {maxCollPerTokenNum > maxCollPerTokenToBeValidNum && (
                          <>
                            <br></br>
                            <br></br>
                            <Important>
                              Liquidating a position whose collateral ratio is
                              greater than {maxCollPerTokenToBeValid} would get
                              disputed using the estimated {priceIdentifierUtf8}{" "}
                              price of {latestPrice.toFixed(4)} and the
                              collateral requirement of{" "}
                              {parseFloat(fromWei(collReq))}. See the{" "}
                              <a
                                href={DOCS_MAP.FINAL_FEE}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                UMA docs
                              </a>
                              .
                            </Important>
                          </>
                        )}
                        <Box pt={2} pb={2}>
                          <Grid container spacing={4}>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                type="number"
                                inputProps={{ min: "0", step: collRatio / 100 }}
                                label={`Min collateral/token`}
                                value={minCollPerToken}
                                error={collRatio < minCollPerTokenNum}
                                helperText={
                                  collRatio < minCollPerTokenNum &&
                                  `Current collateral ratio of ${collRatio.toFixed(
                                    4
                                  )} is below the specified minimum ratio, transaction will revert.`
                                }
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => setMinCollPerToken(e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                type="number"
                                inputProps={{ min: "0", step: collRatio / 100 }}
                                label={`Max collateral/token`}
                                value={maxCollPerToken}
                                error={collRatio > maxCollPerTokenNum}
                                helperText={
                                  collRatio > maxCollPerTokenNum &&
                                  `Current collateral ratio of ${collRatio.toFixed(
                                    4
                                  )} is above the specified maximum ratio, transaction will revert.`
                                }
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => setMaxCollPerToken(e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                type="number"
                                inputProps={{
                                  min: "0",
                                  max: positionTokensOutstanding.toString(),
                                }}
                                label={`Max tokens to liquidate`}
                                error={
                                  tokenBalanceTooLow || tokensToLiquidateInvalid
                                }
                                helperText={
                                  tokenBalanceTooLow
                                    ? `${tokenSymbol} balance too low`
                                    : tokensToLiquidateInvalid
                                    ? `Invalid liquidation amount`
                                    : null
                                }
                                value={maxTokensToLiquidate}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => setMaxTokensToLiquidate(e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <FormControl fullWidth>
                                <InputLabel>Deadline</InputLabel>
                                <Select
                                  value={deadline}
                                  onChange={(
                                    e: React.ChangeEvent<{ value: unknown }>
                                  ) => setDeadline(e.target.value as string)}
                                >
                                  <MenuItem value={60}>1 minute</MenuItem>
                                  <MenuItem value={5 * 60}>5 minutes</MenuItem>
                                  <MenuItem value={30 * 60}>
                                    30 minutes
                                  </MenuItem>
                                  <MenuItem value={60 * 60}>1 hour</MenuItem>
                                  <MenuItem value={5 * 60 * 60}>
                                    5 hours
                                  </MenuItem>
                                  <MenuItem value={1911772800}>
                                    Forever
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </Box>

                        <Box textAlign="center" pt={2} pb={2}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={executeLiquidation}
                            disabled={
                              !(
                                minCollPerToken &&
                                maxCollPerToken &&
                                maxTokensToLiquidate &&
                                deadline &&
                                !collBalanceTooLow() &&
                                !tokenBalanceTooLow &&
                                collRatio >= minCollPerTokenNum &&
                                collRatio <= maxCollPerTokenNum
                              )
                            }
                          >{`Submit liquidation`}</Button>
                        </Box>
                        {liquidationNeedAllowanceText() !== "" && (
                          <Typography>
                            <strong>Note: </strong>
                            {liquidationNeedAllowanceText()}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
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

export default PositionActionsDialog;
