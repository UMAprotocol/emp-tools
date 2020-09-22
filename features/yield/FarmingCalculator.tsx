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

// TODO: `rollToToken` needs to be replaced with NOV20 token addresses
const ROLL_REWARDS_SCHEDULE: { [key: string]: any } = {
  "0xb2fdd60ad80ca7ba89b9bab3b5336c2601c020b4": {
    rollToTokenName: "uUSDrETH-NOV20",
    rollToToken: "0xb2fdd60ad80ca7ba89b9bab3b5336c2601c020b4",
    rollStartDate: Date.UTC(2020, 8, 23, 23, 0, 0, 0),
    rollDate: Date.UTC(2020, 8, 27, 23, 0, 0, 0),
  }, // yUSDETH-Oct20 --> yUSDETH-Nov20
  "0x208d174775dc39fe18b1b374972f77ddec6c0f73": {
    rollToTokenName: "uUSDrBTC-NOV20",
    rollToToken: "0x208d174775dc39fe18b1b374972f77ddec6c0f73",
    rollStartDate: Date.UTC(2020, 8, 23, 23, 0, 0, 0),
    rollDate: Date.UTC(2020, 8, 27, 23, 0, 0, 0),
  }, // uUSDrBTC-OCT --> uUSDrBTC-Nov20
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
  const currentTokenPrice = getTokenPrice(tokenAddress);
  const [yUSDPrice, setyUSDPrice] = useState<string>("");
  const [yUSDAdded, setyUSDAdded] = useState<string>("");
  const [USDCAdded, setUSDCAdded] = useState<string>("");
  const [poolLiquidity, setPoolLiquidity] = useState<string>("");
  const [rewardToken, setRewardToken] = useState<any[] | null>(null);

  // Yield outputs:
  const [fracLiquidity, setFracLiquidity] = useState<string>("");
  const [rewardYieldAmounts, setRewardYieldAmounts] = useState<{
    [key: string]: number;
  }>({});
  const [rewardTokenPrices, setRewardTokenPrices] = useState<{
    [key: string]: number;
  }>({});
  const [apr, setApr] = useState<string>("");

  // Roll inputs
  const [rollToTokenObj, setRollToTokenObj] = useState<any | null>(null);
  const [rollToTokenAddress, setRollToTokenAddress] = useState<string>(
    tokenAddress
  );

  // Roll outputs
  const rollFromPool = getPoolDataForToken(tokenAddress);
  const rollToPool = getPoolDataForToken(rollToTokenAddress);
  const rollStartDate = rollToTokenObj && rollToTokenObj.rollStartDate;
  const rollTokenName = rollToTokenObj && rollToTokenObj.rollToTokenName;
  const rollDate = rollToTokenObj && rollToTokenObj.rollDate;
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
  // `timeUntilRoll` will be > 0 if mid-roll, < 0 if post-roll, or false if roll has not started
  const timeUntilRoll =
    rollStartDate &&
    currentDateUTC.valueOf() - rollStartDate.valueOf() > 0 &&
    rollDate &&
    rollDate.valueOf() - currentDateUTC.valueOf();
  const isRolled = timeUntilRoll ? timeUntilRoll <= 0 : true;
  const hoursRemainingToFarmingRoll =
    timeUntilRoll && timeUntilRoll / 1000 / 60 / 60;

  const setDefaultValues = async () => {
    if (currentTokenPrice && rollFromPool) {
      setyUSDPrice(currentTokenPrice.toString());

      // Scenario 1: Roll has finished, reward to current pool has ended
      if (timeUntilRoll && isRolled && rollToPool) {
        setPoolLiquidity("0");
      }
      // Scenario 2: Roll is currently undergoing, contributions to either pool should accrue equally.
      else if (timeUntilRoll && !isRolled && rollToPool) {
        setPoolLiquidity(
          (rollToPool.pool.liquidity + rollFromPool.pool.liquidity).toString()
        );
      }
      // Scenario 3: Roll has not happened yet or is not applicable, reward to current pool only
      else {
        setPoolLiquidity(rollFromPool.pool.liquidity.toString());
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
    } else {
      setApr("0");
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

  // Set roll and LM reward token information
  useEffect(() => {
    if (address) {
      setTokenAddress(address.toLowerCase());
    }
    if (Object.keys(WEEKLY_UMA_REWARDS).includes(tokenAddress)) {
      setRewardToken(WEEKLY_UMA_REWARDS[tokenAddress]);
    }

    // Check if token should display roll information.
    if (Object.keys(ROLL_REWARDS_SCHEDULE).includes(tokenAddress)) {
      setRollToTokenObj(ROLL_REWARDS_SCHEDULE[tokenAddress]);
    } else {
      setRollToTokenObj(null);
    }

    // Update roll rewards information.
    if (rollToTokenObj) {
      setRollToTokenAddress(rollToTokenObj.rollToToken.toLowerCase());
    }
  }, [address, tokenAddress, rollToTokenObj]);

  // Update default pool information
  useEffect(() => {
    setDefaultValues();
  }, [currentTokenPrice, rollFromPool, rollToPool, tokenAddress]);

  // Update APR
  useEffect(() => {
    calculateApr();
  }, [tokenAddress, poolLiquidity, rewardToken, rewardTokenPrices]);

  // Update pool ownership
  useEffect(() => {
    if (rollFromPool && rollToPool && yUSDAdded === "" && USDCAdded === "") {
      const userShareFractionRollFrom = rollFromPool.userSharesFraction;
      const yUSDShareRollFrom =
        rollFromPool.pool.tokenBalanceEmp * userShareFractionRollFrom;
      const USDCShareRollFrom =
        rollFromPool.pool.tokenBalanceOther * userShareFractionRollFrom;

      const userShareFractionRollTo = rollToPool.userSharesFraction;
      const yUSDShareRollTo =
        rollToPool.pool.tokenBalanceEmp * userShareFractionRollTo;
      const USDCShareRollTo =
        rollToPool.pool.tokenBalanceOther * userShareFractionRollTo;

      setyUSDAdded((yUSDShareRollFrom + yUSDShareRollTo).toString());
      setUSDCAdded((USDCShareRollFrom + USDCShareRollTo).toString());
    }
  }, [rollFromPool, rollToPool]);

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
        {timeUntilRoll && timeUntilRoll > 0 && (
          <>
            <br></br>
            <br></br>
            <Typography>
              <strong>Update (09/23 @ 23:00 UTC):</strong> Before September
              23rd, 23:00 UTC, LP contributions to either the OCT20 or the NOV20
              are considered equally. What this means is that UMA rewards are
              granted pro-rata as: (your USD contribution) / (total OCT20
              liquidity + total NOV20 liquidity). After September 27, 23:00 UTC,
              only LP contributions in the NOV20 pool will count towards
              liquidity mining rewards.
            </Typography>
          </>
        )}
        <br></br>
        <br></br>
        <Typography>
          <strong>Tokens eligible for liquidity mining:</strong>{" "}
          {timeUntilRoll
            ? isRolled
              ? rollTokenName
              : `${tokenSymbol} + ${rollTokenName}`
            : tokenSymbol}
          <br></br>
          {hoursRemainingToFarmingRoll && hoursRemainingToFarmingRoll > 0 && (
            <>
              <strong>Hours remaining until liquidity mining rolls:</strong>{" "}
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
                          (Number(fracLiquidity) * rewardObj.count) / 100;
                        const userRewardUsd =
                          userReward * rewardTokenPrices[rewardObj.token];
                        return (
                          <Typography key={rewardObj.token}>
                            {"- "}
                            <strong>
                              {userReward.toLocaleString() +
                                ` ${rewardObj.token}`}
                            </strong>
                            {` ($${userRewardUsd.toLocaleString()})`}
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
