import { useState } from "react";
import styled from "styled-components";
import { Box, Button, Typography, Grid } from "@material-ui/core";
import { utils } from "ethers";

import EmpContract from "../../containers/EmpContract";
import EmpState from "../../containers/EmpState";
import Collateral from "../../containers/Collateral";
import Position from "../../containers/Position";
import OoState from "../../containers/OoState";
import Token from "../../containers/Token";
import Etherscan from "../../containers/Etherscan";
import { DOCS_MAP } from "../../constants/docLinks";

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const Important = styled(Typography)`
  color: red;
  background: black;
  display: inline-block;
`;

enum CONTRACT_STATE {
  OPEN,
  PRICE_REQUESTED,
  PRICE_RECEIVED,
}

const { formatUnits: fromWei } = utils;

const SettleExpired = () => {
  const { contract: emp } = EmpContract.useContainer();
  const { empState } = EmpState.useContainer();
  const {
    priceIdentifierUtf8,
    expirationTimestamp,
    contractState,
    isExpired,
    expiryPrice,
  } = empState;
  const { symbol: collSymbol, decimals: collDec } = Collateral.useContainer();
  const {
    tokens: posTokensString,
    collateral: posCollString,
  } = Position.useContainer();
  const {
    symbol: tokenSymbol,
    allowance: tokenAllowance,
    decimals: tokenDec,
    setMaxAllowance,
    balance: tokenBalance,
  } = Token.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();
  const { ooState } = OoState.useContainer();
  const { resolvedPrice: dvmResolvedPrice } = ooState;

  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  if (
    posTokensString !== null &&
    posCollString !== null &&
    tokenBalance !== null &&
    tokenDec !== null &&
    tokenSymbol !== null &&
    tokenAllowance !== null &&
    emp !== null &&
    priceIdentifierUtf8 !== null &&
    expirationTimestamp !== null &&
    contractState !== null &&
    collDec !== null &&
    expiryPrice !== null &&
    isExpired !== null &&
    isExpired // If contract has not expired, then do not render this component
  ) {
    const expiryDate = new Date(
      Number(expirationTimestamp) * 1000
    ).toLocaleString("en-GB", { timeZone: "UTC" });
    const posTokens = Number(posTokensString);
    const posColl = Number(posCollString);
    const needsToRequestSettlementPrice = contractState === CONTRACT_STATE.OPEN;

    // Resolved price is either the DVM's resolved price, the EMP's stored price (once a settle() is called),
    // or 0.
    // TODO: add comment about why we're doing this.
    const expiryPricePrecision = tokenDec === collDec ? 18 : collDec;
    const resolvedPrice = dvmResolvedPrice
      ? dvmResolvedPrice
      : parseFloat(fromWei(expiryPrice.toString(), expiryPricePrecision));
    const hasEmpPrice = resolvedPrice !== 0;

    // Error conditions for calling settle expired:
    const needAllowance =
      tokenAllowance !== "Infinity" && tokenAllowance < tokenBalance;
    const canSettleTokens = tokenBalance > 0 || posTokens > 0;

    // Calculate collateral to receive if price was resolved.
    let positionTRV: number | null = null;
    let excessCollateral: number | null = null;
    let balanceTRV: number | null = null;
    let collateralToReceive: number | null = null;
    if (resolvedPrice !== null) {
      positionTRV = posTokens * resolvedPrice;
      excessCollateral = Math.max(posColl - positionTRV, 0);
      balanceTRV = tokenBalance * resolvedPrice;
      collateralToReceive = excessCollateral + balanceTRV;
    }

    const settleExpired = async () => {
      if (canSettleTokens) {
        setHash(null);
        setSuccess(null);
        setError(null);
        try {
          // This will fail if the DVM has not resolved a price yet.
          const tx = await emp.settleExpired();
          setHash(tx.hash as string);
          await tx.wait();
          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setError(
          new Error(
            "You have no tokens in your wallet or your position to settle"
          )
        );
      }
    };

    const requestSettlementPrice = async () => {
      if (needsToRequestSettlementPrice) {
        setHash(null);
        setSuccess(null);
        setError(null);
        try {
          const tx = await emp.expire();
          setHash(tx.hash as string);
          await tx.wait();
          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setError(
          new Error("A settlement price has already been requested or received")
        );
      }
    };

    return (
      <Box>
        <Box pt={2} pb={4}>
          <Typography>
            Settling expired tokens will redeem your{" "}
            <strong>{tokenSymbol}</strong> tokens for{" "}
            <strong>{collSymbol}</strong>. The amount of{" "}
            <strong>{collSymbol}</strong> returned is determined by the
            settlement price of {priceIdentifierUtf8} for the expiration
            timestamp ({expiryDate}).
            <br></br>
            <br></br>
            You will receive the settlement value of your tokens (
            <strong>{tokenSymbol} * settlement price</strong>) in{" "}
            <strong>{collSymbol}</strong>.<br></br>
            <br></br>
            If you are a position sponsor, then you will also receive your
            "excess collateral", which is the amount of{" "}
            <strong>{collSymbol}</strong> in your position minus the settlement
            value of outstanding <strong>{tokenSymbol}</strong> debt.
            <br></br>
            <br></br>
            Learn more about the settlement process{" "}
            <a
              href={DOCS_MAP.EXPIRY_SETTLEMENT}
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
            .
          </Typography>
          <br></br>
        </Box>

        {needsToRequestSettlementPrice && (
          <Box pb={4}>
            <Important>
              The {tokenSymbol} contract has expired, but you cannot settle your
              tokens until a settlement price has been requested and resolved.
            </Important>
            <br></br>
            <br></br>
            <Button variant="contained" onClick={requestSettlementPrice}>
              Request Settlement Price
            </Button>
          </Box>
        )}

        {!needsToRequestSettlementPrice && (
          <>
            {hasEmpPrice ? (
              <Grid container spacing={3}>
                <Grid item md={4} sm={6} xs={12}>
                  <Box>
                    {needAllowance && (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={setMaxAllowance}
                        style={{ marginRight: `12px` }}
                      >
                        Max Approve
                      </Button>
                    )}
                    {!needAllowance && (
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={!canSettleTokens}
                        onClick={settleExpired}
                      >
                        {`Settle ${tokenSymbol}`}
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Box pb={4}>
                <Important>
                  You cannot settle your tokens until a settlement price has
                  been resolved by the DVM.
                </Important>
              </Box>
            )}
          </>
        )}

        {hasEmpPrice &&
          positionTRV !== null &&
          excessCollateral !== null &&
          balanceTRV !== null &&
          collateralToReceive !== null && (
            <Box py={4}>
              <Typography>{`Resolved price (${priceIdentifierUtf8} @ ${expiryDate}): ${resolvedPrice}`}</Typography>
              <Typography>{`Collateral in position: ${posColl}`}</Typography>
              <Typography>{`Redemption value of outstanding tokens in position: ${positionTRV}`}</Typography>
              <Typography>
                <strong>{`Excess collateral in position that you will receive: ${excessCollateral}`}</strong>
              </Typography>
              <Typography>
                <strong>{`Redemption value of tokens in your wallet: ${balanceTRV}`}</strong>
              </Typography>
              <br></br>
              <br></br>
              <Typography>{`Total ${collSymbol} you will receive: ${collateralToReceive}`}</Typography>
            </Box>
          )}

        {hash && (
          <Box py={2}>
            <Typography>
              <strong>Tx Hash: </strong>
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
  } else {
    return (
      <Box>
        <Box py={2}>
          <Typography>
            <i>This contract has not expired yet</i>
          </Typography>
        </Box>
      </Box>
    );
  }
};

export default SettleExpired;
