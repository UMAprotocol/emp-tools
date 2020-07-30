import { Box, TextField, Typography, Grid } from "@material-ui/core";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Balancer from "../../containers/Balancer";

import { getUmaPrice } from "./UmaTokenPrice";

const FormInput = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const WEEKS_PER_YEAR = 52;

const YieldCalculator = () => {
  const { usdPrice, pool } = Balancer.useContainer();
  const [umaPrice, setUmaPrice] = useState<number | null>(4.0);
  const [yUSDAdded, setyUSDAdded] = useState<string | null>("1000");
  const [USDCAdded, setUSDCAdded] = useState<string | null>("1000");
  const [fracLiquidity, setFracLiquidity] = useState<string | null>(null);
  const [umaYieldAmount, setUmaYieldAmount] = useState<string | null>(null);
  const [usdYieldAmount, setUsdYieldAmount] = useState<string | null>(null);
  const [apr, setApr] = useState<string | null>(null);

  getUmaPrice().then((price) => {
    setUmaPrice(price);
  });

  const calculateYield = () => {
    if (!yUSDAdded || Number(yUSDAdded) < 0) {
      return null;
    }
    if (!USDCAdded || Number(USDCAdded) < 0) {
      return null;
    }
    if (!usdPrice || Number(usdPrice) < 0) {
      return null;
    }
    if (!pool) {
      return null;
    }
    if (!umaPrice) {
      return null;
    }
    const totalValueAddedToPool =
      Number(USDCAdded) + Number(yUSDAdded) * Number(usdPrice);
    if (!totalValueAddedToPool || totalValueAddedToPool == 0) {
      return null;
    }
    const fracLiquidityProvided =
      totalValueAddedToPool / Number(pool.liquidity);
    setFracLiquidity((fracLiquidityProvided * 100).toFixed(4));
    const weeklyUMARewarded = 25000;
    const umaPaidPerWeek = fracLiquidityProvided * weeklyUMARewarded;
    setUmaYieldAmount(umaPaidPerWeek.toFixed(4));
    const usdYieldPerWeek = umaPaidPerWeek * umaPrice;
    setUsdYieldAmount(usdYieldPerWeek.toFixed(4));

    const apr =
      ((umaPaidPerWeek * WEEKS_PER_YEAR * umaPrice) / totalValueAddedToPool) *
      100;
    setApr(apr.toFixed(4));
  };

  // Update the yield whenever the parameters change.
  useEffect(() => {
    calculateYield();
  }, [usdPrice, yUSDAdded, USDCAdded]);

  return (
    <span>
      <Typography variant="h5">UMA Liquidity Mining</Typography>
      <Typography>
        During the liquidity mining program 25k UMA rewards will be paid out to
        LP providers in the yUSD balancer pool. Rewards are calculated as a
        pro-rata contribution to the liquidity pool. To learn more about the
        liquidity mining program see UMA Medium post{" "}
        <a
          href="https://medium.com/uma-project/liquidity-mining-on-uma-is-now-live-5f6cb0bd53ee"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </a>
        .
      </Typography>

      <Box pt={2}>
        <form noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid item md={4} sm={6} xs={12}>
              <FormInput>
                <TextField
                  fullWidth
                  type="number"
                  label="yUSD added to pool"
                  value={yUSDAdded?.toString() || ""}
                  onChange={(e) => setyUSDAdded(e.target.value)}
                  variant="outlined"
                  inputProps={{ min: "0", step: "1" }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormInput>
            </Grid>
            <Grid item md={4} sm={6} xs={12}>
              <FormInput>
                <TextField
                  fullWidth
                  type="number"
                  label="USDC added to pool"
                  value={USDCAdded?.toString() || ""}
                  onChange={(e) => setUSDCAdded(e.target.value)}
                  inputProps={{ min: "0" }}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormInput>
            </Grid>
            <Grid item md={4} sm={6} xs={12}>
              <Box pt={1} textAlign="center">
                <Typography variant="h6">
                  Liquidity provision share: <strong>{fracLiquidity}%</strong>
                </Typography>
              </Box>
            </Grid>
            <Grid item md={6} sm={6} xs={12}>
              <Box textAlign="center">
                <Typography variant="h6">
                  Weekly rewards: <strong>{umaYieldAmount} UMA</strong>
                </Typography>
                <Typography>~{usdYieldAmount} USD per week</Typography>
              </Box>
            </Grid>
            <Grid item md={6} sm={6} xs={12}>
              <Box textAlign="center">
                <Typography variant="h6">
                  Yearly APR in USD <strong>{apr}%</strong>
                </Typography>
                <Typography>At current UMA price of {umaPrice}</Typography>
              </Box>
            </Grid>
          </Grid>
        </form>
        <Box pt={4}>
          <Typography>
            <strong>Note: </strong>Providing liquidity on Balancer will{" "}
            <i>also</i> yield BAL rewards over and above UMA. To calculate your
            BAL rewards use{" "}
            <a
              href="https://www.predictions.exchange/balancer/None"
              target="_blank"
              rel="noopener noreferrer"
            >
              this
            </a>{" "}
            calculator.
          </Typography>
        </Box>
      </Box>
    </span>
  );
};

export default YieldCalculator;
