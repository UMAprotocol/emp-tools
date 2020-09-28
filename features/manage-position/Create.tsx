import { utils } from "ethers";
import styled from "styled-components";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Tooltip,
  InputAdornment,
} from "@material-ui/core";

import EmpContract from "../../containers/EmpContract";
import { useState, useEffect } from "react";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import EmpState from "../../containers/EmpState";
import Totals from "../../containers/Totals";
import Position from "../../containers/Position";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";
import Connection from "../../containers/Connection";

import { legacyEMPs } from "../../constants/legacyEmps";
import { getLiquidationPrice } from "../../utils/getLiquidationPrice";
import { isPricefeedInvertedFromTokenSymbol } from "../../utils/getOffchainPrice";
import { DOCS_MAP } from "../../constants/docLinks";
import { toWeiSafe } from "../../utils/convertToWeiSafely";

const Important = styled(Typography)`
  color: red;
  background: black;
  display: inline-block;
`;

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const MinLink = styled.div`
  text-decoration-line: underline;
`;

const { formatUnits: fromWei, parseBytes32String: hexToUtf8 } = utils;

const Create = () => {
  const { network } = Connection.useContainer();
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
    collateral: posCollateralString,
    tokens: posTokensString,
    pendingWithdraw,
  } = Position.useContainer();
  const { latestPrice } = PriceFeed.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  const [collateral, setCollateral] = useState<string>("0");
  const [tokens, setTokens] = useState<string>("0");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const collateralNum = Number(collateral) || 0;
  const tokensNum = Number(tokens) || 0;

  const {
    collateralRequirement: collReq,
    minSponsorTokens,
    priceIdentifier,
  } = empState;
  const liquidationPriceWarningThreshold = 0.1;

  // Sets `collateral` to the min amount of collateral that can be added to `startingCollateral` to keep the CR <= GCR.
  const _setBackingCollateralToMin = (
    _gcr: number,
    _tokens: number,
    startingCollateral: number
  ) => {
    // Set amount of collateral to the minimum required by the GCR constraint. This
    // is intended to encourage users to maximize their capital efficiency.
    const minBackingCollateral = _gcr * _tokens - startingCollateral;
    if (minBackingCollateral < 0) {
      setCollateral("0");
    } else {
      // We want to round down the number for better UI display, but we don't actually want the collateral
      // amount to round down since we want the minimum amount of collateral to pass the GCR constraint. So,
      // we'll add a tiny amount of collateral to avoid accidentally rounding too low.
      setCollateral((minBackingCollateral + 0.00005).toFixed(4));
    }
  };

  const setBackingCollateralToMin = (
    _gcr: number,
    transactionTokens: number,
    resultantPositionTokens: number,
    positionTokens: number,
    positionCollateral: number,
    isLegacyEmp: boolean
  ) => {
    if (isLegacyEmp) {
      // In legacy EMP's, transaction CR must be > GCR
      _setBackingCollateralToMin(_gcr, transactionTokens, 0);
    } else {
      // Current EMP's require position CR must be > GCR otherwise transaction CR > GCR, therefore
      // if the current CR < GCR, then the min amount of collateral to deposit is equal to transaction CR (and resultant
      // CR will still be < GCR). If the current CR > GCR, then the min amount of collateral to deposit would set the
      // resultant CR to the GCR
      const currentCR =
        positionTokens > 0 ? positionCollateral / positionTokens : 0;
      if (currentCR < _gcr) {
        _setBackingCollateralToMin(_gcr, transactionTokens, 0);
      } else {
        _setBackingCollateralToMin(
          _gcr,
          resultantPositionTokens,
          positionCollateral
        );
      }
    }
  };

  // Sets `tokens` to the max amount of tokens that can be added to `startingTokens` to keep the CR <= GCR.
  const _setTokensToMax = (
    _gcr: number,
    collateral: number,
    startingTokens: number
  ) => {
    // Set amount of tokens to the maximum required by the GCR constraint. This
    // is intended to encourage users to maximize their capital efficiency.
    const maxTokensToCreate = _gcr > 0 ? collateral / _gcr - startingTokens : 0;
    // Unlike the min collateral, we're ok if we round down the tokens slightly as round down
    // can only increase the position's CR and maintain it above the GCR constraint.
    setTokens((maxTokensToCreate - 0.0001).toFixed(4));
  };

  const setTokensToMax = (
    _gcr: number,
    transactionCollateral: number,
    resultantPositionCollateral: number,
    positionTokens: number,
    positionCollateral: number,
    isLegacyEmp: boolean
  ) => {
    if (isLegacyEmp) {
      // In legacy EMP's, transaction CR must be > GCR
      _setTokensToMax(_gcr, transactionCollateral, 0);
    } else {
      // Current EMP's require position CR must be > GCR otherwise transaction CR > GCR, therefore
      // if the current CR < GCR, then the max amount of tokens to mint is equal to transaction CR (and resultant
      // CR will still be < GCR). If the current CR > GCR, then the max amount of tokens to mint would set the
      // resultant CR to the GCR
      const currentCR =
        positionTokens > 0 ? positionCollateral / positionTokens : 0;
      if (currentCR < _gcr) {
        _setTokensToMax(_gcr, transactionCollateral, 0);
      } else {
        _setTokensToMax(_gcr, resultantPositionCollateral, positionTokens);
      }
    }
  };

  if (
    network !== null &&
    collReq !== null &&
    collDec !== null &&
    balance !== null &&
    collAllowance !== null &&
    emp !== null &&
    posTokensString !== null &&
    posCollateralString !== null &&
    minSponsorTokens !== null &&
    tokenDec !== null &&
    latestPrice !== null &&
    gcr !== null &&
    pendingWithdraw !== null &&
    tokenSymbol !== null &&
    collSymbol !== null &&
    priceIdentifier !== null
  ) {
    const collReqFromWei = parseFloat(fromWei(collReq));
    const collateralToDeposit = Number(collateral) || 0;
    const tokensToCreate = Number(tokens) || 0;
    const minSponsorTokensFromWei = parseFloat(
      fromWei(minSponsorTokens, tokenDec)
    );
    const hasPendingWithdraw = pendingWithdraw === "Yes";
    const priceIdentifierUtf8 = hexToUtf8(priceIdentifier);
    const prettyLatestPrice = Number(latestPrice).toFixed(4);
    const posTokens = Number(posTokensString);
    const posCollateral = Number(posCollateralString);

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
      collReqFromWei,
      isPricefeedInvertedFromTokenSymbol(tokenSymbol)
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
    const resultantTokensBelowMin =
      resultantTokens < minSponsorTokensFromWei && resultantTokens !== 0;
    const resultantCRBelowRequirement =
      parseFloat(pricedResultantCR) >= 0 &&
      parseFloat(pricedResultantCR) < collReqFromWei;
    const transactionCRBelowGCR = transactionCR < gcr;
    const resultantCRBelowGCR = resultantCR < gcr;
    const isLegacyEmp = legacyEMPs[network.chainId].includes(emp.address);
    const cannotMint = isLegacyEmp
      ? transactionCRBelowGCR
      : transactionCRBelowGCR && resultantCRBelowGCR;

    const mintTokens = async () => {
      if (collateralToDeposit >= 0 && tokensToCreate > 0) {
        setHash(null);
        setSuccess(null);
        setError(null);
        try {
          const collateralWei = toWeiSafe(collateral, collDec);
          const tokensWei = toWeiSafe(tokens);
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
            <Grid item md={4} sm={6} xs={12}>
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
                  `Below minimum of ${minSponsorTokensFromWei}`
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTokens(e.target.value)
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip
                        placement="top"
                        title="Maximum amount of tokens with entered collateral"
                      >
                        <Button
                          fullWidth
                          onClick={() =>
                            setTokensToMax(
                              gcr,
                              collateralNum,
                              resultantCollateral,
                              posTokens,
                              posCollateral,
                              isLegacyEmp
                            )
                          }
                        >
                          <MinLink>Max</MinLink>
                        </Button>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item md={4} sm={6} xs={12}>
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
                  `${collSymbol} balance is too low`
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCollateral(e.target.value)
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip
                        placement="top"
                        title="Minimum amount of collateral with entered tokens"
                      >
                        <Button
                          fullWidth
                          onClick={() =>
                            setBackingCollateralToMin(
                              gcr,
                              tokensNum,
                              resultantTokens,
                              posTokens,
                              posCollateral,
                              isLegacyEmp
                            )
                          }
                        >
                          <MinLink>Min</MinLink>
                        </Button>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item md={4} sm={6} xs={12}>
              <Box py={0}>
                {needAllowance && (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={setMaxAllowance}
                  >
                    Max Approve
                  </Button>
                )}
                {!needAllowance && (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={mintTokens}
                    disabled={
                      cannotMint ||
                      balanceBelowCollateralToDeposit ||
                      resultantCRBelowRequirement ||
                      resultantTokensBelowMin ||
                      collateralToDeposit < 0 ||
                      tokensToCreate <= 0
                    }
                  >
                    {`Create ${tokensToCreate} ${tokenSymbol} with ${collateralToDeposit} ${collSymbol}`}
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>

          <Box pt={4}>
            <Typography>
              {`Transaction CR: `}
              <Tooltip
                placement="right"
                title={
                  transactionCRBelowGCR &&
                  cannotMint &&
                  `This transaction CR must be above the GCR: ${pricedGCR}`
                }
              >
                <span
                  style={{
                    color:
                      transactionCRBelowGCR && cannotMint ? "red" : "unset",
                  }}
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
            <Box pt={2}>
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
