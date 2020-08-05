import styled from "styled-components";
import { utils, BigNumberish } from "ethers";
const { formatUnits: fromWei, parseUnits: toWei } = utils;
import { useState, MouseEvent, Fragment } from "react";

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
  const { dvmState } = DvmState.useContainer();
  const { finalFee } = dvmState;
  const { getEtherscanUrl } = Etherscan.useContainer();
  const { contract: emp } = EmpContract.useContainer();
  const { latestPrice } = PriceFeed.useContainer();
  const {
    symbol: tokenSymbol,
    balance: tokenBalance,
    allowance: tokenAllowance,
    setMaxAllowance: setMaxTokenAllowance,
  } = Token.useContainer();
  const {
    symbol: collSymbol,
    balance: collBalance,
    allowance: collAllowance,
    setMaxAllowance: setMaxCollateralAllowance,
  } = Collateral.useContainer();
  const { activeSponsors } = EmpSponsors.useContainer();

  const [dialogTabIndex, setDialogTabIndex] = useState<string | null>(
    "deposit"
  );
  const [collateralToDeposit, setCollateralToDeposit] = useState<string>("");
  const [minCollPerToken, setMinCollPerToken] = useState<string>("");
  const [maxCollPerToken, setMaxCollPerToken] = useState<string>("");
  const [maxTokensToLiquidate, setMaxTokensToLiquidate] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");

  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const {
    priceIdentifier: priceId,
    collateralRequirement: collReq,
    currentTime,
  } = empState;

  const setDialogTab = (
    event: MouseEvent<HTMLElement>,
    newAlignment: string | null
  ) => {
    setDialogTabIndex(newAlignment);
  };

  const prettyBalance = (x: number) => {
    const x_string = x.toFixed(4);
    return utils.commify(x_string);
  };

  const prettyAddress = (x: String | null) => {
    if (!x) return "N/A";
    return x.substr(0, 6) + "..." + x.substr(x.length - 6, x.length);
  };
  if (
    props.selectedSponsor &&
    activeSponsors[props.selectedSponsor] &&
    latestPrice &&
    collReq
  ) {
    const sponsorPosition = activeSponsors[props.selectedSponsor];

    const pendingWithdrawTimeRemaining =
      Number(sponsorPosition.withdrawalTimestamp) - Number(currentTime);

    const pendingWithdrawTimeString =
      pendingWithdrawTimeRemaining && pendingWithdrawTimeRemaining > 0
        ? Math.max(0, Math.floor(pendingWithdrawTimeRemaining / 3600)) +
          ":" +
          Math.max(0, Math.floor((pendingWithdrawTimeRemaining % 3600) / 60)) +
          ":" +
          Math.max(0, (pendingWithdrawTimeRemaining % 3600) % 60)
        : "None";

    const pendingTransferTimeRemaining =
      Number(sponsorPosition.TransferTimestamp) - Number(currentTime);

    const pendingTransferTimeString =
      pendingTransferTimeRemaining && pendingTransferTimeRemaining > 0
        ? Math.max(0, Math.floor(pendingTransferTimeRemaining / 3600)) +
          ":" +
          Math.max(0, Math.floor((pendingTransferTimeRemaining % 3600) / 60)) +
          ":" +
          Math.max(0, (pendingTransferTimeRemaining % 3600) % 60)
        : "None";

    const underCollateralizedPrice =
      Number(sponsorPosition.collateral) /
      (Number(sponsorPosition.tokensOutstanding) *
        parseFloat(fromWei(collReq)));

    const underCollateralizedPercent =
      ((Number(latestPrice) - Number(underCollateralizedPrice)) /
        Number(latestPrice)) *
      100;

    const collBalanceTooLow = () => {
      if (dialogTabIndex == "deposit") {
        return (collBalance || 0) < (Number(collateralToDeposit) || 0);
      }
      if (dialogTabIndex == "liquidate") {
        return (collBalance || 0) < (finalFee || 0);
      }
    };

    const tokenBalanceTooLow =
      (tokenBalance || 0) < (Number(maxTokensToLiquidate) || 0);

    const needCollateralAllowance = () => {
      if (dialogTabIndex == "deposit") {
        if (collAllowance === null || collateralToDeposit === null) return true;
        if (collAllowance === "Infinity") return false;
        return collAllowance < parseFloat(collateralToDeposit);
      }
      if (dialogTabIndex == "liquidate") {
        if (collAllowance === null || finalFee == null) return true;
        if (collAllowance === "Infinity") return false;
        return collAllowance < finalFee;
      }
      return true;
    };
    const needTokenAllowance = () => {
      if (tokenAllowance === null || maxTokensToLiquidate === null) return true;
      if (tokenAllowance === "Infinity") return false;
      return tokenAllowance < parseFloat(maxTokensToLiquidate);
    };

    // Liquidation requires both collateral and synthetic to be approved. This
    // results in a number of different configurations the user could be in depending
    // on their interaction with this Dapp. Process the text here to keep the
    // component simple.
    const liquidationNeedAllowanceText = () => {
      if (!needCollateralAllowance() && !needTokenAllowance()) {
        return null;
      }
      if (needCollateralAllowance() && !needTokenAllowance()) {
        return `You will need to sign two transactions one to approve collateral ${collSymbol} and a second to preform the liquidation.`;
      }
      if (!needCollateralAllowance() && needTokenAllowance()) {
        return `You will need to sign two transactions one to approve synthetic ${tokenSymbol} and a second to preform the liquidation.`;
      }
      if (needCollateralAllowance() && needTokenAllowance()) {
        return `You will need to sign three transactions one to approve synthetic ${tokenSymbol}, one to approve collateral ${collSymbol} and a third to preform the liquidation.`;
      }
    };

    const executeDeposit = async () => {
      if (collateralToDeposit && !collBalanceTooLow() && emp) {
        setHash(null);
        setSuccess(null);
        setError(null);
        const collateralToDepositWei = toWei(collateralToDeposit);

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
        minCollPerToken &&
        maxCollPerToken &&
        maxTokensToLiquidate &&
        deadline &&
        !collBalanceTooLow() &&
        !tokenBalanceTooLow &&
        emp
      ) {
        setHash(null);
        setSuccess(null);
        setError(null);
        const minCollPerTokenWei = toWei(minCollPerToken);
        const maxCollPerTokenWei = toWei(maxCollPerToken);
        const maxTokensToLiquidateWei = toWei(maxTokensToLiquidate);
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
              <Box>
                <h1>Additional Position Actions</h1>
                <Status>
                  <Label>Sponsor: </Label>
                  <a
                    href={
                      props.selectedSponsor
                        ? getEtherscanUrl(props.selectedSponsor)
                        : "N/A"
                    }
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
                  <Status>
                    <Label>Withdraw liveness time remaining: </Label>
                    {pendingWithdrawTimeString}
                  </Status>
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
                <hr />
              </Box>
              <Box pt={2} textAlign="center">
                <ToggleButtonGroup
                  value={dialogTabIndex}
                  exclusive
                  onChange={setDialogTab}
                >
                  <ToggleButton value="deposit">deposit</ToggleButton>
                  <ToggleButton value="liquidate">liquidate</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box>
                {dialogTabIndex === "deposit" && (
                  <Box pt={2}>
                    <Typography>
                      <strong>
                        Deposit collateral into this sponsor's position
                      </strong>
                      <br></br>
                      You can add additional collateral to this position, even
                      if it's not yours.
                    </Typography>
                    <Box pt={2}>
                      <Grid container spacing={4}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="number"
                            inputProps={{ min: "0" }}
                            label={`Collateral (${collSymbol})`}
                            placeholder="1234"
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
                              <Button fullWidth variant="contained" disabled>
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
                          transactions one to approve {collSymbol} and a second
                          to preform the deposit.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
                {dialogTabIndex === "liquidate" && (
                  <Box pt={2}>
                    <Typography>
                      <strong>Liquidate this sponsor</strong>
                      <br></br>For the position to be under collateralize{" "}
                      {priceId ? utils.parseBytes32String(priceId) : "N/A"}{" "}
                      would need to{" "}
                      {underCollateralizedPrice > latestPrice
                        ? "increase"
                        : "decrease"}{" "}
                      by {Math.abs(underCollateralizedPercent | 0)}% from{" "}
                      {latestPrice?.toFixed(4)} to{" "}
                      {underCollateralizedPrice?.toFixed(4)}. You can still
                      liquidate this position if you have a different opinion on
                      the {priceId ? utils.parseBytes32String(priceId) : "N/A"}{" "}
                      price.
                      <br></br>
                      <br></br>
                    </Typography>
                    <Important>
                      Exercise caution! Incorrectly liquidating a position can
                      loose you money! See the{" "}
                      <a
                        href="https://docs.umaproject.org/synthetic-tokens/explainer#liquidation-and-dispute"
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
                            placeholder="1234"
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
                            placeholder="1234"
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
                            placeholder="1234"
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
                              <MenuItem value={30 * 60}>30 minutes</MenuItem>
                              <MenuItem value={60 * 60}>1 hour</MenuItem>
                              <MenuItem value={5 * 60 * 60}>5 hours</MenuItem>
                              <MenuItem value={1911772800}>Forever</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box textAlign="center" pt={2} pb={2}>
                      {minCollPerToken &&
                      maxCollPerToken &&
                      maxTokensToLiquidate &&
                      deadline &&
                      !collBalanceTooLow() &&
                      !tokenBalanceTooLow ? (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={executeLiquidation}
                        >{`Submit liquidation`}</Button>
                      ) : (
                        <Button fullWidth variant="contained" disabled>
                          Submit liquidation
                        </Button>
                      )}
                    </Box>
                    {liquidationNeedAllowanceText() && (
                      <Typography>
                        <strong>Note: </strong>
                        {liquidationNeedAllowanceText()}
                      </Typography>
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

export default PositionActionsDialog;
