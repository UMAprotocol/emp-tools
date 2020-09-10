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
const WEEKLY_UMA_REWARDS: { [key: string]: any[] } = {
  "0xb2fdd60ad80ca7ba89b9bab3b5336c2601c020b4": [
    { token: "UMA", count: 25000, getPrice: getUmaPrice },
  ], // yUSDETH-Oct20
  "0x208d174775dc39fe18b1b374972f77ddec6c0f73": [
    { token: "UMA", count: 10000, getPrice: getUmaPrice },
    { token: "REN", count: 25000, getPrice: getRenPrice },
  ], // uUSDrBTC-OCT
};

const FarmingCalculator = () => {
  const {
    getTokenPrice,
    getPoolDataForToken,
    YIELD_TOKENS,
    poolAddress,
  } = Balancer.useContainer();
  const { symbol: tokenSymbol, address } = Token.useContainer();

  // Set a default token address
  const [tokenAddress, setTokenAddress] = useState<string>(
    Object.keys(YIELD_TOKENS)[0].toLowerCase()
  );

  // Yield inputs:
  const [yUSDPrice, setyUSDPrice] = useState<string>("");
  const [yUSDAdded, setyUSDAdded] = useState<string>("");
  const [USDCAdded, setUSDCAdded] = useState<string>("");
  const [poolLiquidity, setPoolLiquidity] = useState<string>("");
  const [rewardToken, setRewardToken] = useState<any[] | null>(null);
  const [rewardTokenPrice, setRewardTokenPrice] = useState<number | null>(null);

  // Set reward token data
  const _rewardTokenPrice = getTokenPrice(tokenAddress);
  useEffect(() => {
    if (address) {
      setTokenAddress(address.toLowerCase());
    }
    if (Object.keys(WEEKLY_UMA_REWARDS).includes(tokenAddress)) {
      setRewardToken(WEEKLY_UMA_REWARDS[tokenAddress]);
    }
    if (tokenAddress && _rewardTokenPrice) {
      setRewardTokenPrice(_rewardTokenPrice);
    }
  }, [address, _rewardTokenPrice, tokenAddress]);

  // Roll inputs:
  const sept20PoolData = getPoolDataForToken(
    Object.keys(YIELD_TOKENS)[0].toLowerCase()
  );
  const rewardTokenPoolData = getPoolDataForToken(tokenAddress);
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

  // Yield outputs:
  const [fracLiquidity, setFracLiquidity] = useState<string>("");
  const [rewardYieldAmounts, setRewardYieldAmounts] = useState<{
    [key: string]: number;
  }>({});
  const [rewardTokenPrices, setRewardTokenPrices] = useState<{
    [key: string]: number;
  }>({});
  const [apr, setApr] = useState<string>("");

  const setDefaultValues = async () => {
    if (rewardTokenPrice && rewardTokenPoolData && sept20PoolData) {
      // Note: usdPrice should be a combination of the two pools prior to Aug 28 but the error is small
      // so we will hardcode this to the Oct price.
      setyUSDPrice(rewardTokenPrice.toString());
      if (!isRolled) {
        setPoolLiquidity(
          (
            rewardTokenPoolData.pool.liquidity + sept20PoolData.pool.liquidity
          ).toString()
        );
      } else {
        setPoolLiquidity(rewardTokenPoolData.pool.liquidity.toString());
      }
    }
  };

  const calculateApr = async () => {
    if (Number(poolLiquidity) > 0 && rewardToken) {
      const fracUnitLiquidityProvided = 1 / Number(poolLiquidity);
      let usdPaidPerWeek = 0;

      // Sum USD rewards for each reward token
      interface rewardTokenMap {
        [key: string]: number;
      }
      const usdRewards: rewardTokenMap = {};
      const tokenPrices: rewardTokenMap = {};
      for (let rewardObj of rewardToken) {
        const _tokenPrice = await rewardObj.getPrice();
        tokenPrices[rewardObj.token] = _tokenPrice;
        const _rewards = rewardObj.count;
        const _usdYield = _tokenPrice * _rewards;
        usdPaidPerWeek += _usdYield;
        usdRewards[rewardObj.token] = _usdYield;
      }

      setRewardYieldAmounts(usdRewards);
      setRewardTokenPrices(tokenPrices);
      let _apr = usdPaidPerWeek * fracUnitLiquidityProvided * WEEKS_PER_YEAR;
      setApr((_apr * 100).toFixed(4));
    }
  };

  const calculatePoolShare = (
    _yUSDAdded: number,
    _USDCAdded: number,
    _yUSDPrice: number,
    _poolLiquidity: number
  ) => {
    if (
      _yUSDAdded < 0 ||
      _USDCAdded < 0 ||
      _yUSDPrice < 0 ||
      _poolLiquidity <= 0
    ) {
      return null;
    }

    const totalValueAddedToPool = _USDCAdded + _yUSDPrice * _yUSDAdded;
    const fracLiquidityProvided = totalValueAddedToPool / _poolLiquidity;

    return {
      fracLiquidityProvided,
    };
  };

  // Update default pool information
  useEffect(() => {
    setDefaultValues();
  }, [rewardTokenPrice, sept20PoolData, rewardTokenPoolData, tokenAddress]);

  // Update APR
  useEffect(() => {
    calculateApr();
  }, [tokenAddress, poolLiquidity]);

  // Update pool ownership
  useEffect(() => {
    if (
      sept20PoolData &&
      rewardTokenPoolData &&
      yUSDAdded === "" &&
      USDCAdded === ""
    ) {
      const userShareFractionSept = sept20PoolData.userSharesFraction;
      const yUSDShareSept =
        sept20PoolData.pool.tokenBalanceEmp * userShareFractionSept;
      const USDCShareSept =
        sept20PoolData.pool.tokenBalanceOther * userShareFractionSept;

      const userShareFractionOct = rewardTokenPoolData.userSharesFraction;
      const yUSDShareOct =
        rewardTokenPoolData.pool.tokenBalanceEmp * userShareFractionOct;
      const USDCShareOct =
        rewardTokenPoolData.pool.tokenBalanceOther * userShareFractionOct;

      setyUSDAdded((yUSDShareSept + yUSDShareOct).toString());
      setUSDCAdded((USDCShareSept + USDCShareOct).toString());
    }
  }, [sept20PoolData, rewardTokenPoolData]);

  // Update pool share
  useEffect(() => {
    const updatedPoolShare = calculatePoolShare(
      Number(yUSDAdded) || 0,
      Number(USDCAdded) || 0,
      Number(yUSDPrice) || 0,
      Number(poolLiquidity) || 0
    );

    if (updatedPoolShare !== null) {
      setFracLiquidity(
        (updatedPoolShare.fracLiquidityProvided * 100).toFixed(4)
      );
    }
  }, [yUSDAdded, USDCAdded, yUSDPrice, poolLiquidity]);

  // Render page once all data is loaded
  // Only display farming calculator for tokens eligible for LM rewards
  if (!rewardToken) {
    return (
      <Box>
        <Typography>
          <i>Selected token is ineligible for liquidity mining rewards</i>
        </Typography>
      </Box>
    );
  } else {
    return (
      <span>
        <Typography variant="h5">UMA Liquidity Mining</Typography>

        <br></br>
        <Typography>
          During the liquidity mining program UMA and potentially other token
          rewards will be paid out to LP providers in certain yield token
          balancer pools. Rewards are calculated as a pro-rata contribution to
          the liquidity pool. To learn more about the liquidity mining program
          see UMA Medium post{" "}
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
          {rewardToken &&
            rewardToken.map((rewardObj) => {
              return (
                rewardYieldAmounts[rewardObj.token] &&
                rewardTokenPrices[rewardObj.token] && (
                  <span key={rewardObj.token}>
                    <br></br>
                    <strong>
                      Weekly {rewardObj.token} distributed to pool:
                    </strong>
                    {" " + rewardObj.count.toLocaleString()} ($
                    {rewardYieldAmounts[rewardObj.token].toLocaleString()})
                    <br></br>
                    {`- 1 ${rewardObj.token} = $${rewardTokenPrices[
                      rewardObj.token
                    ].toLocaleString()}`}
                  </span>
                )
              );
            })}
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
                    Projected weekly rewards:
                  </Typography>
                  {fracLiquidity &&
                    rewardToken &&
                    rewardToken.map((rewardObj) => {
                      if (rewardTokenPrices[rewardObj.token]) {
                        const userReward =
                          Number(fracLiquidity) * rewardObj.count;
                        const userRewardUsd =
                          userReward * rewardTokenPrices[rewardObj.token];
                        return (
                          <Typography key={rewardObj.token}>
                            {"- "}
                            <strong>
                              {userReward.toLocaleString() +
                                ` ${
                                  rewardObj.token
                                } ($${userRewardUsd.toLocaleString()})`}
                            </strong>
                          </Typography>
                        );
                      }
                    })}
                </Box>
              </Grid>
              <Grid item md={6} sm={6} xs={12}>
                <Box textAlign="center">
                  <Typography variant="h6">
                    Yearly APR in USD <strong>{apr}%</strong>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </form>
          <Box pt={4}>
            <Typography>
              <strong>Note: </strong>Providing liquidity on Balancer will also
              yield BAL rewards over and above liquidity mining rewards. To
              calculate your BAL rewards use{" "}
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
  }
};

export default FarmingCalculator;
