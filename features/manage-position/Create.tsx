import { ethers } from "ethers";
import styled from "styled-components";
import { Box, Button, TextField, Typography } from "@material-ui/core";

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

const Container = styled(Box)`
  max-width: 720px;
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

const fromWei = ethers.utils.formatUnits;
const hexToUtf8 = ethers.utils.parseBytes32String;

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
    cRatio,
    pendingWithdraw,
  } = Position.useContainer();
  const { latestPrice } = PriceFeed.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  const [collateral, setCollateral] = useState<string>("0");
  const [tokens, setTokens] = useState<string>("0");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { collateralRequirement: collReq, minSponsorTokens } = empState;
  const collReqFromWei =
    collReq !== null && collDec !== null
      ? parseFloat(fromWei(collReq, collDec))
      : null;
  const collReqPct =
    collReqFromWei !== null ? `${collReqFromWei * 100}%` : "N/A";
  const balanceTooLow = (balance || 0) < (Number(collateral) || 0);

  const needAllowance = () => {
    if (collAllowance === null || collateral === null) return true;
    if (collAllowance === "Infinity") return false;
    return collAllowance < parseFloat(collateral);
  };

  const mintTokens = async () => {
    if (collateral && tokens && emp) {
      setHash(null);
      setSuccess(null);
      setError(null);
      try {
        const collateralWei = ethers.utils.parseUnits(collateral);
        const tokensWei = ethers.utils.parseUnits(tokens);
        const tx = await emp.create([collateralWei], [tokensWei]);
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

  const handleCreateClick = () => {
    const firstPosition = posTokens !== null && posTokens.toString() === "0";
    if (!firstPosition) {
      mintTokens();
    } else {
      // first time minting, check min sponsor tokens
      if (tokens !== null && minSponsorTokens && tokenDec) {
        const insufficientMinting =
          parseFloat(tokens) < parseFloat(fromWei(minSponsorTokens, tokenDec));
        if (insufficientMinting) {
          alert(
            `You must mint at least ${fromWei(
              minSponsorTokens,
              tokenDec
            )} token(s).`
          );
        } else {
          mintTokens();
        }
      }
    }
  };

  const computeCR = () => {
    if (
      collateral === null ||
      tokens === null ||
      posCollateral === null ||
      posTokens === null ||
      latestPrice === null
    )
      return null;

    // all values non-null, proceed to calculate
    const totalCollateral = posCollateral + parseFloat(collateral);
    const totalTokens = posTokens + parseFloat(tokens);
    return totalCollateral / totalTokens;
  };
  const computedCR = computeCR() || cRatio;

  const pricedCR =
    latestPrice !== null && latestPrice > 0 && computedCR !== null
      ? computedCR / Number(latestPrice)
      : null;
  const pricedGCR =
    gcr !== null && latestPrice !== null && latestPrice > 0
      ? gcr / Number(latestPrice)
      : null;

  const liquidationPrice =
    posCollateral !== null && posTokens !== null
      ? getLiquidationPrice(
          parseFloat(collateral) + posCollateral,
          parseFloat(tokens) + posTokens,
          collReqFromWei
        )
      : null;

  // User has not selected an EMP yet. We can detect this by checking if any properties in `empState` are `null`.
  if (collReq === null) {
    return (
      <Container>
        <Box py={2}>
          <Typography>
            <i>Please first select an EMP from the dropdown above.</i>
          </Typography>
        </Box>
      </Container>
    );
  }

  if (pendingWithdraw === null || pendingWithdraw === "Yes") {
    return (
      <Container>
        <Box py={2}>
          <Typography>
            <i>
              You need to cancel or execute your pending withdrawal request
              before creating additional tokens.
            </i>
          </Typography>
        </Box>
      </Container>
    );
  }

  // User has no pending withdrawal requests so they can create tokens.
  return (
    <Container>
      <Box py={2}>
        <Typography>
          <i>
            Mint new synthetic tokens ({tokenSymbol}) via this EMP contract.
          </i>
        </Typography>
      </Box>
      <Box pb={2}>
        <Box py={2}>
          <Important>
            IMPORTANT! Please read this carefully or you may lose money.
          </Important>
        </Box>
        <Box pt={2}>
          <Typography>
            When minting, your resulting collateralization ratio (collateral /
            tokens) must be above the GCR and you need to mint at least{" "}
            {minSponsorTokens && tokenDec
              ? fromWei(minSponsorTokens, tokenDec)
              : "N/A"}{" "}
            token(s).
          </Typography>
        </Box>
        <Box py={2}>
          <Typography>
            Ensure that you maintain {collReqPct} collateralization or else you
            will get liquidated. Remember to sell your tokens after you mint
            them if you want to short the underlying.
          </Typography>
        </Box>
        <Box py={2}>
          <Typography>
            When you're ready, fill in the desired amount of collateral and
            tokens below and click the "Create" button.
          </Typography>
        </Box>
      </Box>

      <Box py={2}>
        <TextField
          type="number"
          label={`Collateral (${collSymbol})`}
          placeholder="1234"
          inputProps={{ min: "0" }}
          value={collateral}
          error={balanceTooLow}
          helperText={balanceTooLow ? "Balance too low" : null}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCollateral(e.target.value)
          }
        />
      </Box>
      <Box py={2}>
        <TextField
          type="number"
          label={`Tokens (${tokenSymbol})`}
          placeholder="1234"
          inputProps={{ min: "0" }}
          value={tokens}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTokens(e.target.value)
          }
        />
      </Box>
      <Box py={2}>
        {needAllowance() && (
          <Button
            variant="contained"
            onClick={setMaxAllowance}
            style={{ marginRight: `12px` }}
          >
            Approve
          </Button>
        )}
        {tokens &&
        collateral &&
        gcr !== null &&
        !needAllowance() &&
        computedCR !== null &&
        computedCR > gcr &&
        !balanceTooLow ? (
          <Button
            variant="contained"
            onClick={handleCreateClick}
          >{`Create ${tokens} ${tokenSymbol} with ${collateral} ${collSymbol}`}</Button>
        ) : (
          <Button variant="contained" disabled>
            Create
          </Button>
        )}
      </Box>

      <Box py={2}>
        <Typography>
          Resulting Liquidation Price:{" "}
          {liquidationPrice !== null && empState?.priceIdentifier && (
            <span>
              {liquidationPrice?.toFixed(4)}
              {` ${hexToUtf8(empState.priceIdentifier)}`}
            </span>
          )}
        </Typography>
        <Typography>
          Resulting CR:{" "}
          {computedCR !== null && pricedCR !== null && gcr !== null && (
            <span style={{ color: computedCR < gcr ? "red" : "unset" }}>
              {pricedCR?.toFixed(4)}
            </span>
          )}
        </Typography>
        <Typography>Current GCR: {pricedGCR?.toFixed(4) || "N/A"}</Typography>
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
    </Container>
  );
};

export default Create;
