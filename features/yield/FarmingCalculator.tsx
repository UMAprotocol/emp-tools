import { Box, TextField, Typography, Grid } from "@material-ui/core";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Balancer from "../../containers/Balancer";
import Token from "../../containers/Token";

import { getUmaPrice, getRenPrice } from "../../utils/getCoinGeckoTokenPrice";

const FormInput = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const WEEKS_PER_YEAR = 52;
// const WEEKLY_UMA_REWARDS = 25000;
const WEEKLY_UMA_REWARDS: { [key: string]: any } = {
  "0xb2fdd60ad80ca7ba89b9bab3b5336c2601c020b4": {
    UMA: 25000,
  }, // yUSDETH-Oct20
  "0x208d174775dc39fe18b1b374972f77ddec6c0f73": {
    UMA: 10000,
    REN: 25000,
  }, // uUSDrBTC-OCT
};

const FarmingCalculator = () => {
  const {
    getTokenPrice,
    getPoolDataForToken,
    YIELD_TOKENS,
    poolAddress,
  } = Balancer.useContainer();
  const { symbol: tokenSymbol, address } = Token.useContainer();

  // Farming calculations for rolling between yUSD pools
  if (
    !Object.keys(WEEKLY_UMA_REWARDS).includes(
      (address && address.toLowerCase()) || ""
    )
  )
    return null;
  const tokenAddress =
    address !== null ? address : Object.keys(YIELD_TOKENS)[1];
  const octPrice = getTokenPrice(tokenAddress.toLowerCase());
  const sept20PoolData = getPoolDataForToken(
    Object.keys(YIELD_TOKENS)[0].toLowerCase()
  );
  const oct20PoolData = getPoolDataForToken(tokenAddress.toLowerCase());

  const cutOffDateForRoll = Date.UTC(2020, 7, 28, 23, 0, 0, 0);
  const currentDate = new Date();
  const currentDateUTC = Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate(),
    currentDate.getUTCHours(),
    currentDate.getUTCMinutes(),
    currentDate.getUTCSeconds(),
    currentDate.getUTCMilliseconds()
  );
  const timeRemainingToFarmingRoll =
    cutOffDateForRoll.valueOf() - currentDateUTC.valueOf();
  const isRolled = timeRemainingToFarmingRoll <= 0;
  const hoursRemainingToFarmingRoll =
    timeRemainingToFarmingRoll / 1000 / 60 / 60;

  // Yield inputs:
  const [umaPrice, setUmaPrice] = useState<number>(0);
  const [renPrice, setRenPrice] = useState<number>(0);
  const [yUSDPrice, setyUSDPrice] = useState<string>("");
  const [yUSDAdded, setyUSDAdded] = useState<string>("");
  const [USDCAdded, setUSDCAdded] = useState<string>("");
  const [poolLiquidity, setPoolLiquidity] = useState<string>("");
  const [weeklyUmaRewards, setWeeklyUmaRewards] = useState<number>(0);
  const [weeklyRenRewards, setWeeklyRenRewards] = useState<number>(0);

  // Yield outputs:
  const [fracLiquidity, setFracLiquidity] = useState<string>("");
  const [renYieldAmount, setRenYieldAmount] = useState<string>("");
  const [umaYieldAmount, setUmaYieldAmount] = useState<string>("");
  const [usdYieldAmount, setUsdYieldAmount] = useState<string>("");
  const [apr, setApr] = useState<string>("");

  async function setDefaultValues() {
    if (octPrice && oct20PoolData && sept20PoolData) {
      // Note: usdPrice should be a combination of the two pools prior to Aug 28 but the error is small
      // so we will hardcode this to the Oct price.
      setyUSDPrice(octPrice.toString());
      setUmaPrice(await getUmaPrice());
      setRenPrice(await getRenPrice());
      if (!isRolled) {
        setPoolLiquidity(
          (
            oct20PoolData.pool.liquidity + sept20PoolData.pool.liquidity
          ).toString()
        );
      } else {
        setPoolLiquidity(oct20PoolData.pool.liquidity.toString());
      }
    }
  }

  const calculateYield = (
    _yUSDAdded: number,
    _USDCAdded: number,
    _yUSDPrice: number,
    _poolLiquidity: number,
    _tokenPrice: number,
    _weeklyPoolRewards: number
  ) => {
    if (
      _yUSDAdded < 0 ||
      _USDCAdded < 0 ||
      _yUSDPrice < 0 ||
      _poolLiquidity <= 0 ||
      _tokenPrice < 0 ||
      _weeklyPoolRewards < 0
    ) {
      return null;
    }

    const totalValueAddedToPool = _USDCAdded + _yUSDPrice * _yUSDAdded;
    const fracLiquidityProvided = totalValueAddedToPool / _poolLiquidity;
    const tokensPaidPerWeek = fracLiquidityProvided * _weeklyPoolRewards;
    const usdYieldPerWeek = tokensPaidPerWeek * _tokenPrice;

    let apr = 0;
    if (totalValueAddedToPool > 0) {
      apr = (usdYieldPerWeek * WEEKS_PER_YEAR) / totalValueAddedToPool;
    }

    return {
      fracLiquidityProvided,
      tokensPaidPerWeek,
      usdYieldPerWeek,
      apr,
    };
  };

  // Update state whenever container data changes.
  useEffect(() => {
    setDefaultValues();

    if (WEEKLY_UMA_REWARDS[tokenAddress.toLowerCase()]) {
      const selectedTokenRewards =
        WEEKLY_UMA_REWARDS[tokenAddress.toLowerCase()];
      setWeeklyUmaRewards(selectedTokenRewards.UMA.toString());
      if (Object.keys(selectedTokenRewards).includes("REN")) {
        setWeeklyRenRewards(selectedTokenRewards.REN.toString());
      } else {
        setWeeklyRenRewards(0);
      }
    }
  }, [octPrice, sept20PoolData, oct20PoolData, tokenAddress]);

  // Update pool ownership whenever user changes.
  useEffect(() => {
    if (
      sept20PoolData &&
      oct20PoolData &&
      yUSDAdded === "" &&
      USDCAdded === ""
    ) {
      const userShareFractionSept = sept20PoolData.userSharesFraction;
      const yUSDShareSept =
        sept20PoolData.pool.tokenBalanceEmp * userShareFractionSept;
      const USDCShareSept =
        sept20PoolData.pool.tokenBalanceOther * userShareFractionSept;

      const userShareFractionOct = oct20PoolData.userSharesFraction;
      const yUSDShareOct =
        oct20PoolData.pool.tokenBalanceEmp * userShareFractionOct;
      const USDCShareOct =
        oct20PoolData.pool.tokenBalanceOther * userShareFractionOct;

      setyUSDAdded((yUSDShareSept + yUSDShareOct).toString());
      setUSDCAdded((USDCShareSept + USDCShareOct).toString());
    }
  }, [sept20PoolData, oct20PoolData]);

  // Update yield amount whenever inputs change.
  useEffect(() => {
    const updatedUmaYield = calculateYield(
      Number(yUSDAdded) || 0,
      Number(USDCAdded) || 0,
      Number(yUSDPrice) || 0,
      Number(poolLiquidity) || 0,
      Number(umaPrice) || 0,
      weeklyUmaRewards
    );
    const updatedRenYield = calculateYield(
      Number(yUSDAdded) || 0,
      Number(USDCAdded) || 0,
      Number(yUSDPrice) || 0,
      Number(poolLiquidity) || 0,
      Number(renPrice) || 0,
      weeklyRenRewards
    );

    if (updatedUmaYield !== null) {
      setFracLiquidity(
        (updatedUmaYield.fracLiquidityProvided * 100).toFixed(4)
      );
      setUmaYieldAmount(updatedUmaYield.tokensPaidPerWeek.toFixed(4));
      setUsdYieldAmount(updatedUmaYield.usdYieldPerWeek.toFixed(4));
      setApr((updatedUmaYield.apr * 100).toFixed(4));
    }
    if (updatedRenYield !== null) {
      setRenYieldAmount(updatedRenYield.tokensPaidPerWeek.toFixed(4));
      setUsdYieldAmount(updatedRenYield.usdYieldPerWeek.toFixed(4));
    }
    if (updatedRenYield !== null && updatedUmaYield !== null) {
      setUsdYieldAmount(
        (
          updatedUmaYield.usdYieldPerWeek + updatedRenYield.usdYieldPerWeek
        ).toFixed(4)
      );
      setApr(((updatedUmaYield.apr + updatedRenYield.apr) * 100).toFixed(4));
    }
  }, [yUSDAdded, USDCAdded, yUSDPrice, poolLiquidity, umaPrice, renPrice]);

  return (
    <span>
      <Typography variant="h5">
        UMA {weeklyRenRewards !== 0 && <span>& REN</span>} Liquidity Mining
      </Typography>

      <br></br>
      <Typography>
        During the liquidity mining program UMA{" "}
        {weeklyRenRewards !== 0 && <span>& REN</span>} rewards will be paid out
        to LP providers in certain yield token balancer pools. Rewards are
        calculated as a pro-rata contribution to the liquidity pool. To learn
        more about the liquidity mining program see UMA Medium post{" "}
        <a
          href="https://medium.com/uma-project/liquidity-mining-on-uma-is-now-live-5f6cb0bd53ee"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </a>
        .
      </Typography>
      {hoursRemainingToFarmingRoll > 0 && (
        <>
          <br></br>
          <br></br>
          <Typography>
            <strong>Update (08/24 @ 23:00 UTC):</strong> Before August 28th,
            23:00 UTC, LP contributions to either the yUSD-SEP20 or the
            yUSD-OCT20 are considered equally. What this means is that UMA
            rewards are granted pro-rata as: (your USD contribution) / (total
            SEP20 liquidity + total OCT20 liquidity). After August 28, 23:00
            UTC, only LP contributions in the OCT20 pool will count towards
            liquidity mining rewards.
          </Typography>
        </>
      )}
      <br></br>
      <br></br>
      <Typography>
        <strong>Pools eligible for liquidity mining:</strong>{" "}
        {isRolled ? "yUSD-OCT, uUSDrBTC-OCT" : "SEPT + OCT"}
        <br></br>
        {hoursRemainingToFarmingRoll > 0 && (
          <>
            <strong>
              Hours remaining until liquidity mining rolls to OCT:
            </strong>{" "}
            {hoursRemainingToFarmingRoll.toFixed(2)}
            <br></br>
          </>
        )}
        <strong>Total liquidity eligible for mining rewards:</strong> $
        {Number(poolLiquidity).toLocaleString()}
        <br></br>
        <strong>Weekly UMA rewards for selected pool:</strong>{" "}
        {weeklyUmaRewards.toLocaleString()}
        {weeklyRenRewards !== 0 && (
          <span>
            <br></br>
            <strong>Weekly REN rewards for selected pool:</strong>{" "}
            {weeklyRenRewards.toLocaleString()}
          </span>
        )}
        <br></br>
      </Typography>

      <Box pt={2}>
        <form noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid item md={4} sm={6} xs={12}>
              <FormInput>
                <TextField
                  fullWidth
                  type="number"
                  label={`${tokenSymbol} added to pool`}
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
                  Weekly rewards: <strong>{umaYieldAmount} UMA</strong>{" "}
                  {weeklyRenRewards !== 0 && (
                    <span>
                      <br></br>
                      <strong>+ {renYieldAmount} REN</strong>
                    </span>
                  )}
                </Typography>
                <Typography>~{usdYieldAmount} USD per week</Typography>
              </Box>
            </Grid>
            <Grid item md={6} sm={6} xs={12}>
              <Box textAlign="center">
                <Typography variant="h6">
                  Yearly APR in USD <strong>{apr}%</strong>
                </Typography>
                <Typography>
                  At current UMA price of {umaPrice}
                  {weeklyRenRewards !== 0 && (
                    <span>
                      <br></br> & REN price of {renPrice}
                    </span>
                  )}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </form>
        <Box pt={4}>
          <Typography>
            <strong>Note: </strong>Providing liquidity on Balancer will also
            yield BAL rewards over and above UMA{" "}
            {weeklyRenRewards !== 0 && <span>& REN</span>}. To calculate your
            BAL rewards use{" "}
            <a
              href={`https://pools.vision/pool/${
                poolAddress ? poolAddress : ""
              }`}
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
