import { Box, TextField, Typography, Grid } from "@material-ui/core";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Balancer from "../../containers/Balancer";

import { getUmaPrice } from "../../utils/getUmaTokenPrice";

const FormInput = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const WEEKS_PER_YEAR = 52;
const WEEKLY_UMA_REWARDS = 25000;

const FarmingCalculator = () => {
  const { usdPrice, pool, userShareFraction } = Balancer.useContainer();

  // Yield inputs:
  const [umaPrice, setUmaPrice] = useState<string>("");
  const [yUSDPrice, setyUSDPrice] = useState<string>("");
  const [yUSDAdded, setyUSDAdded] = useState<string>("");
  const [USDCAdded, setUSDCAdded] = useState<string>("");
  const [poolLiquidity, setPoolLiquidity] = useState<string>("");

  // Yield outputs:
  const [fracLiquidity, setFracLiquidity] = useState<string>("");
  const [umaYieldAmount, setUmaYieldAmount] = useState<string>("");
  const [usdYieldAmount, setUsdYieldAmount] = useState<string>("");
  const [apr, setApr] = useState<string>("");

  async function setDefaultValues() {
    if (usdPrice !== null && pool !== null) {
      setyUSDPrice(usdPrice.toString());
      setPoolLiquidity(pool.liquidity.toString());
      setUmaPrice(await getUmaPrice());
    }
  }

  const calculateYield = (
    _yUSDAdded: number,
    _USDCAdded: number,
    _yUSDPrice: number,
    _poolLiquidity: number,
    _umaPrice: number
  ) => {
    if (
      _yUSDAdded < 0 ||
      _USDCAdded < 0 ||
      _yUSDPrice < 0 ||
      _poolLiquidity <= 0 ||
      _umaPrice < 0
    ) {
      return null;
    }

    const totalValueAddedToPool = _USDCAdded + _yUSDPrice * _yUSDAdded;
    const fracLiquidityProvided = totalValueAddedToPool / _poolLiquidity;
    const umaPaidPerWeek = fracLiquidityProvided * WEEKLY_UMA_REWARDS;
    const usdYieldPerWeek = umaPaidPerWeek * _umaPrice;

    let apr = 0;
    if (totalValueAddedToPool > 0) {
      apr = (usdYieldPerWeek * WEEKS_PER_YEAR) / totalValueAddedToPool;
    }

    return {
      fracLiquidityProvided,
      umaPaidPerWeek,
      usdYieldPerWeek,
      apr,
    };
  };

  // Update state whenever container data changes.
  useEffect(() => {
    setDefaultValues();
  }, [usdPrice, pool]);

  // Update pool ownership whenever user changes.
  useEffect(() => {
    if (userShareFraction !== null && pool !== null) {
      const yUSDShare = pool.tokenBalanceEmp * userShareFraction;
      const USDCShare = pool.tokenBalanceOther * userShareFraction;
      setyUSDAdded(yUSDShare.toString());
      setUSDCAdded(USDCShare.toString());
    }
  }, [userShareFraction, pool]);

  // Update yield amount whenever inputs change.
  useEffect(() => {
    const updatedYield = calculateYield(
      Number(yUSDAdded) || 0,
      Number(USDCAdded) || 0,
      Number(yUSDPrice) || 0,
      Number(poolLiquidity) || 0,
      Number(umaPrice) || 0
    );

    if (updatedYield !== null) {
      setFracLiquidity((updatedYield.fracLiquidityProvided * 100).toFixed(4));
      setUmaYieldAmount(updatedYield.umaPaidPerWeek.toFixed(4));
      setUsdYieldAmount(updatedYield.usdYieldPerWeek.toFixed(4));
      setApr((updatedYield.apr * 100).toFixed(4));
    }
  }, [yUSDAdded, USDCAdded, yUSDPrice, poolLiquidity, umaPrice]);

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
                  value={yUSDAdded}
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
                  value={USDCAdded}
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

export default FarmingCalculator;
