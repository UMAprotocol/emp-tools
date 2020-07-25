import { ethers, utils } from "ethers";
import styled from "styled-components";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Tooltip,
} from "@material-ui/core";

import EmpContract from "../../containers/EmpContract";
import { useState } from "react";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import EmpState from "../../containers/EmpState";
import Totals from "../../containers/Totals";
import Position from "../../containers/Position";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";

import { getLiquidationPrice } from "../../utils/getLiquidationPrice";
import { DOCS_MAP } from "../../utils/getDocLinks";

const Important = styled(Typography)`
  color: red;
  background: black;
  display: inline-block;
`;

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const {
  formatUnits: fromWei,
  parseBytes32String: hexToUtf8,
  parseUnits: toWei,
} = utils;

const Create = () => {
  const { contract: emp } = EmpContract.useContainer();
  const { empState } = EmpState.useContainer();
  const {
    symbol: collSymbol,
    decimals: collDec,
    allowance: collAllowance,
    setMaxAllowance,
    balance,
  } = Collateral.useContainer();
  const { symbol: tokenSymbol, decimals: tokenDec } = Token.useContainer();
  const { gcr } = Totals.useContainer();
  const {
    collateral: posCollateral,
    tokens: posTokens,
    pendingWithdraw,
  } = Position.useContainer();
  const { latestPrice } = PriceFeed.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  const [collateral, setCollateral] = useState<string>("0");
  const [tokens, setTokens] = useState<string>("0");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const {
    collateralRequirement: collReq,
    minSponsorTokens,
    priceIdentifier,
  } = empState;
  const liquidationPriceWarningThreshold = 0.1;

  if (
    collReq !== null &&
    collDec !== null &&
    balance !== null &&
    collAllowance !== null &&
    emp !== null &&
    posTokens !== null &&
    posCollateral !== null &&
    minSponsorTokens !== null &&
    tokenDec !== null &&
    latestPrice !== null &&
    gcr !== null &&
    pendingWithdraw !== null &&
    tokenSymbol !== null &&
    collSymbol !== null &&
    priceIdentifier !== null
  ) {
    const collReqFromWei = parseFloat(fromWei(collReq, collDec));
    const collateralToDeposit = Number(collateral) || 0;
    const tokensToCreate = Number(tokens) || 0;
    const minSponsorTokensFromWei = parseFloat(
      fromWei(minSponsorTokens, tokenDec)
    );
    const hasPendingWithdraw = pendingWithdraw === "Yes";
    const priceIdentifierUtf8 = hexToUtf8(priceIdentifier);
    const prettyLatestPrice = Number(latestPrice).toFixed(4);

    // CR of new tokens to create. This must be > GCR according to https://github.com/UMAprotocol/protocol/blob/837869b97edef108fdf68038f54f540ca95cfb44/core/contracts/financial-templates/expiring-multiparty/PricelessPositionManager.sol#L409
    const transactionCR =
      tokensToCreate > 0 ? collateralToDeposit / tokensToCreate : 0;
    const pricedTransactionCR =
      latestPrice !== 0 ? (transactionCR / latestPrice).toFixed(4) : "0";
    // Resultant CR of position if new tokens were created by depositing chosen amount of collateral.
    // This is a useful data point for the user but has no effect on the contract's create transaction.
    const resultantCollateral = posCollateral + collateralToDeposit;
    const resultantTokens = posTokens + tokensToCreate;
    const resultantCR =
      resultantTokens > 0 ? resultantCollateral / resultantTokens : 0;
    const pricedResultantCR =
      latestPrice !== 0 ? (resultantCR / latestPrice).toFixed(4) : "0";
    const resultantLiquidationPrice = getLiquidationPrice(
      resultantCollateral,
      resultantTokens,
      collReqFromWei
    ).toFixed(4);
    const liquidationPriceDangerouslyFarBelowCurrentPrice =
      parseFloat(resultantLiquidationPrice) <
      (1 - liquidationPriceWarningThreshold) * latestPrice;
    // GCR: total contract collateral / total contract tokens.
    const pricedGCR = latestPrice !== 0 ? (gcr / latestPrice).toFixed(4) : null;

    // Error conditions for calling create:
    const balanceBelowCollateralToDeposit = balance < collateralToDeposit;
    const needAllowance =
      collAllowance !== "Infinity" && collAllowance < collateralToDeposit;
    const resultantTokensBelowMin = resultantTokens < minSponsorTokensFromWei;
    const resultantCRBelowRequirement =
      parseFloat(pricedResultantCR) >= 0 &&
      parseFloat(pricedResultantCR) < collReqFromWei;
    const transactionCRBelowGCR = transactionCR < gcr;

    const mintTokens = async () => {
      if (collateralToDeposit > 0 && tokensToCreate > 0) {
        setHash(null);
        setSuccess(null);
        setError(null);
        try {
          const collateralWei = toWei(collateral);
          const tokensWei = toWei(tokens);
          const tx = await emp.create([collateralWei], [tokensWei]);
          setHash(tx.hash as string);
          await tx.wait();
          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setError(new Error("Collateral and Token amounts must be positive"));
      }
    };

    if (hasPendingWithdraw) {
      return (
        <Box py={2}>
          <Typography>
            <i>
              You need to cancel or execute your pending withdrawal request
              before submitting other position management transactions.
            </i>
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box>
          <Box py={2}>
            <Typography>
              <i>
                Mint new synthetic tokens ({tokenSymbol}) via this EMP contract.
              </i>
            </Typography>
          </Box>
          <Box pb={2}>
            <Important>
              IMPORTANT! Please read this carefully or you may lose money.
            </Important>

            <Box pt={2}>
              <Typography>
                {`When minting, the ratio of new collateral-deposited versus new tokens-created (e.g. the "Transaction CR" value below)
                must be above the GCR (${pricedGCR}), and you need to mint at
                least ${minSponsorTokensFromWei} ${tokenSymbol}. `}
                {`Read more about the GCR `}
                <a
                  href={DOCS_MAP.GCR}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here.
                </a>
              </Typography>
            </Box>
            <Box py={2}>
              <Typography>
                Ensure that you keep your position's CR greater than the{" "}
                <strong>collateral requirement of {collReqFromWei}</strong>, or
                you will be liquidated. This is the "Resulting CR" value below.
                Creating additional tokens can increase or decrease this ratio.
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                variant="outlined"
                label={`Collateral (${collSymbol})`}
                inputProps={{ min: "0", max: balance }}
                value={collateral}
                error={balanceBelowCollateralToDeposit}
                helperText={
                  balanceBelowCollateralToDeposit &&
                  `Your ${collSymbol} balance is too low`
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCollateral(e.target.value)
                }
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                variant="outlined"
                label={`Tokens (${tokenSymbol})`}
                inputProps={{ min: "0" }}
                value={tokens}
                error={resultantTokensBelowMin}
                helperText={
                  resultantTokensBelowMin &&
                  `You must maintain at least ${minSponsorTokensFromWei} ${tokenSymbol} in your position`
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTokens(e.target.value)
                }
              />
            </Grid>
            <Grid item xs={4}>
              <Box py={1}>
                {needAllowance && (
                  <Button
                    variant="contained"
                    onClick={setMaxAllowance}
                    style={{ marginRight: `12px` }}
                  >
                    Max Approve
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={mintTokens}
                  disabled={
                    needAllowance ||
                    transactionCRBelowGCR ||
                    balanceBelowCollateralToDeposit ||
                    resultantCRBelowRequirement ||
                    resultantTokensBelowMin ||
                    collateralToDeposit <= 0 ||
                    tokensToCreate <= 0
                  }
                >
                  {`Create ${tokensToCreate} ${tokenSymbol} with ${collateralToDeposit} ${collSymbol}`}
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Box py={4}>
            <Typography>
              {`Transaction CR: `}
              <Tooltip
                placement="right"
                title={
                  transactionCRBelowGCR &&
                  `This must be above the GCR: ${pricedGCR}`
                }
              >
                <span
                  style={{ color: transactionCRBelowGCR ? "red" : "unset" }}
                >
                  {pricedTransactionCR}
                </span>
              </Tooltip>
            </Typography>
            <Typography>
              {`Resulting liquidation price: `}
              <Tooltip
                placement="right"
                title={
                  liquidationPriceDangerouslyFarBelowCurrentPrice &&
                  parseFloat(resultantLiquidationPrice) > 0 &&
                  `This is >${
                    liquidationPriceWarningThreshold * 100
                  }% below the current price: ${prettyLatestPrice}`
                }
              >
                <span
                  style={{
                    color:
                      liquidationPriceDangerouslyFarBelowCurrentPrice &&
                      parseFloat(resultantLiquidationPrice) > 0
                        ? "red"
                        : "unset",
                  }}
                >
                  {resultantLiquidationPrice} ({priceIdentifierUtf8})
                </span>
              </Tooltip>
            </Typography>
            <Typography>
              {`Resulting CR: `}
              <Tooltip
                placement="right"
                title={
                  resultantCRBelowRequirement &&
                  `This must be above the requirement: ${collReqFromWei}`
                }
              >
                <span
                  style={{
                    color: resultantCRBelowRequirement ? "red" : "unset",
                  }}
                >
                  {pricedResultantCR}
                </span>
              </Tooltip>
            </Typography>
            <Typography>{`GCR: ${pricedGCR}`}</Typography>
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
            <Box py={2}>
              <Typography>
                <span style={{ color: "red" }}>{error.message}</span>
              </Typography>
            </Box>
          )}
        </Box>
      );
    }
  } else {
    return (
      <Box py={2}>
        <Typography>
          <i>Please first connect and select an EMP from the dropdown above.</i>
        </Typography>
      </Box>
    );
  }
};

export default Create;
