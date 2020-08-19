import styled from "styled-components";
import { utils } from "ethers";
const { formatUnits: fromWei, parseUnits: toWei } = utils;
import { useState, MouseEvent } from "react";

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
} from "@material-ui/core";

import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

import EmpState from "../../containers/EmpState";
import DvmState from "../../containers/DvmState";
import Token from "../../containers/Token";
import EmpSponsors from "../../containers/EmpSponsors";
import EmpContract from "../../containers/EmpContract";
import Collateral from "../../containers/Collateral";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";

import { DOCS_MAP } from "../../utils/getDocLinks";

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
    priceIdentifier: priceId,
    collateralRequirement: collReq,
    currentTime,
    isExpired,
  } = empState;
  const { dvmState } = DvmState.useContainer();
  const { finalFee } = dvmState;
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
  const [tabIndex, setTabIndex] = useState<string>("deposit");
  const [collateralToDeposit, setCollateralToDeposit] = useState<string>("");
  const [minCollPerToken, setMinCollPerToken] = useState<string>("");
  const [maxCollPerToken, setMaxCollPerToken] = useState<string>("");
  const [maxTokensToLiquidate, setMaxTokensToLiquidate] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");

  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const setDialogTab = (
    event: MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    setTabIndex(newAlignment);
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
    priceId !== null
  ) {
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

    const underCollateralizedPrice =
      Number(sponsorPosition.collateral) === 0 ||
      Number(sponsorPosition.tokensOutstanding) === 0 ||
      Number(collReq) === 0
        ? 0
        : Number(sponsorPosition.collateral) /
          (Number(sponsorPosition.tokensOutstanding) *
            parseFloat(fromWei(collReq)));

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
        const collateralToDepositWei = toWei(collateralToDeposit, collDecs);

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
      if (!collBalanceTooLow() && !tokenBalanceTooLow) {
        setHash(null);
        setSuccess(null);
        setError(null);
        const minCollPerTokenWei = toWei(minCollPerToken, collDecs);
        const maxCollPerTokenWei = toWei(maxCollPerToken, collDecs);
        const maxTokensToLiquidateWei = toWei(maxTokensToLiquidate, tokenDecs);
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
                  <Label>Minted Synthetics({tokenSymbol}): </Label>
                  {prettyBalance(Number(sponsorPosition.tokensOutstanding))}
                </Status>
                <Status>
                  <Label>Collateral Ratio: </Label>
                  {prettyBalance(Number(sponsorPosition.cRatio))}
                </Status>
                <Status>
                  <Label>Pending withdrawal: </Label>
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
                  <Label>Collateral ratio: </Label>
                  {Number(sponsorPosition.cRatio).toFixed(4)}
                </Status>
                <Status>
                  <Label>Liquidation price: </Label>
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
                  <Box>
                    {tabIndex === "deposit" && (
                      <Box pt={2}>
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
                              second to preform the deposit.
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                    {tabIndex === "liquidate" && (
                      <Box pt={2}>
                        <Typography>
                          <strong>Liquidate this sponsor</strong>
                          <br></br>For the position to be under collateralized{" "}
                          {utils.parseBytes32String(priceId)} would need to{" "}
                          {underCollateralizedPrice > latestPrice
                            ? "increase"
                            : "decrease"}{" "}
                          by {Math.abs(underCollateralizedPercent).toFixed(4)}%
                          from {latestPrice.toFixed(8)} to{" "}
                          {underCollateralizedPrice.toFixed(8)}. You can still
                          liquidate this position if you have a different
                          opinion on the {utils.parseBytes32String(priceId)}{" "}
                          price.
                          <br></br>
                          <br></br>
                        </Typography>
                        <Important>
                          Exercise caution! Incorrectly liquidating a position
                          can lose you money! See the{" "}
                          <a
                            href={DOCS_MAP.FINAL_FEE}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            UMA docs
                          </a>
                          .
                        </Important>
                        <Box pt={2} pb={2}>
                          <Grid container spacing={4}>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                type="number"
                                inputProps={{ min: "0" }}
                                label={`Min collateral/token`}
                                value={minCollPerToken}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => setMinCollPerToken(e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                type="number"
                                inputProps={{ min: "0" }}
                                label={`Max collateral/token`}
                                value={maxCollPerToken}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => setMaxCollPerToken(e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                type="number"
                                inputProps={{ min: "0" }}
                                label={`Max tokens to liquidate`}
                                error={tokenBalanceTooLow}
                                helperText={
                                  tokenBalanceTooLow
                                    ? `${tokenSymbol} balance too low`
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
                                !tokenBalanceTooLow
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
