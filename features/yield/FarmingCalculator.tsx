import { Box, TextField, Typography, Grid, Tooltip } from "@material-ui/core";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Balancer from "../../containers/Balancer";
import Token from "../../containers/Token";
import EmpAddress from "../../containers/EmpAddress";
import DevMining from "../../containers/DevMining";

import {
  WEEKS_PER_YEAR,
  WEEKLY_UMA_REWARDS,
  ROLL_REWARDS_SCHEDULE,
} from "../../constants/rewards";
import { YIELD_TOKENS } from "../../constants/yieldTokens";

const FormInput = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const FarmingCalculator = () => {
  const {
    getTokenPrice,
    getPoolDataForToken,
    poolAddress,
  } = Balancer.useContainer();
  const { symbol: tokenSymbol, address } = Token.useContainer();
  const { empAddress } = EmpAddress.useContainer();
  const { devMiningRewards } = DevMining.useContainer();

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
  const [rollToTokenAddress, setRollToTokenAddress] = useState<string>(
    tokenAddress
  );

  const [isRollToToken, setIsRollToToken] = useState<Boolean>(false);
  const [rollFromTokenObj, setRollFromTokenObj] = useState<any | null>(null);
  const [rollFromTokenAddress, setRollFromTokenAddress] = useState<
    string | null
  >(null);

  // Roll outputs
  const rollFromPool = getPoolDataForToken(
    rollFromTokenAddress || tokenAddress
  );
  const rollToPool = getPoolDataForToken(rollToTokenAddress);
  const rollStartDate = rollFromTokenObj && rollFromTokenObj.rollStartDate;
  const rollFromTokenName =
    rollFromTokenObj && rollFromTokenObj.rollFromTokenName;
  const rollToTokenName = rollFromTokenObj && rollFromTokenObj.rollToTokenName;
  const rollDate = rollFromTokenObj && rollFromTokenObj.rollDate;
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

  const getDateReadable = (dateObj: Date | undefined) => {
    if (!dateObj) return "N/A";
    return new Date(dateObj).toISOString().replace("T", " ").substr(0, 19);
  };
  const setDefaultValues = async () => {
    if (currentTokenPrice && rollFromPool) {
      setyUSDPrice(currentTokenPrice.toString());

      // Scenario 0: Current token is the roll to token and the roll has occurred, reward to current pool only.
      if (timeUntilRoll && isRolled && isRollToToken && rollToPool) {
        setPoolLiquidity(rollToPool.pool.liquidity.toString());
      }
      // Scenario 1: Roll has finished, reward to current pool has ended
      else if (timeUntilRoll && isRolled && rollToPool) {
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

      // Fetch token prices if not set already.
      let tokenPrices: rewardTokenMap = rewardTokenPrices;
      for (let rewardObj of rewardToken) {
        let _tokenPrice;
        if (!tokenPrices[rewardObj.token]) {
          _tokenPrice = await rewardObj.getPrice();
          tokenPrices[rewardObj.token] = _tokenPrice;
        } else {
          _tokenPrice = tokenPrices[rewardObj.token];
        }
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

  // Set roll and LM reward token information from which to calculate APY's.
  useEffect(() => {
    if (address) {
      setTokenAddress(address.toLowerCase());
    }
    if (devMiningRewards == null || empAddress == null) return;
    if (
      rollFromTokenObj &&
      Object.keys(WEEKLY_UMA_REWARDS).includes(tokenAddress) &&
      devMiningRewards.has(empAddress)
    ) {
      // Strip out rewards that have expired or have not started yet.
      const allRewards = WEEKLY_UMA_REWARDS[tokenAddress];
      // First, determine which EMP address is receiving dev rewards. If roll has concluded,
      // then use the current EMP address, other use the rollFromToken's EMP address.
      let liquidityRewards;
      if (isRolled) {
        liquidityRewards = parseFloat(devMiningRewards.get(empAddress) || "0");
      } else {
        liquidityRewards = parseFloat(
          devMiningRewards.get(rollFromTokenObj.rollFromEmpAddress) || "0"
        );
      }
      // Hardcoding LM rewards to half of dev rewards; this should ideally be parameterized.
      liquidityRewards /= 2;
      const filteredRewards = [];
      for (let i = 0; i < allRewards.length; i++) {
        const reward = allRewards[i];
        if (
          reward.endDate &&
          reward.endDate.valueOf() - currentDateUTC.valueOf() < 0
        ) {
          // Reward has expired.
          continue;
        } else if (
          reward.startDate &&
          currentDateUTC.valueOf() - reward.startDate.valueOf() < 0
        ) {
          // Reward has not started.
          continue;
        } else {
          if (reward.token == "UMA") {
            reward.count = liquidityRewards;
          }
          filteredRewards.push(reward);
        }
      }

      setRewardToken(filteredRewards);
    } else {
      setRewardToken(null);
    }

    // Check if token should display roll information.
    if (Object.keys(ROLL_REWARDS_SCHEDULE).includes(tokenAddress)) {
      setRollFromTokenObj(ROLL_REWARDS_SCHEDULE[tokenAddress]);
      setRollToTokenAddress(
        ROLL_REWARDS_SCHEDULE[tokenAddress].rollToToken.toLowerCase()
      );
    } else {
      setRollFromTokenObj(null);
    }

    for (const rollFromAddress of Object.keys(ROLL_REWARDS_SCHEDULE)) {
      if (ROLL_REWARDS_SCHEDULE[rollFromAddress].rollToToken == tokenAddress) {
        setRollToTokenAddress(tokenAddress);
        setRollFromTokenObj(ROLL_REWARDS_SCHEDULE[rollFromAddress]);
        setRollFromTokenAddress(rollFromAddress);
        setIsRollToToken(true);
        break;
      } else {
        setIsRollToToken(false);
      }
    }
  }, [
    address,
    tokenAddress,
    rollFromTokenObj,
    rollFromTokenAddress,
    devMiningRewards,
  ]);

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
          <i>Selected token is ineligible for liquidity mining rewards.</i>
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
              <strong>Liquidity mining rewards during the roll:</strong> Before{" "}
              {getDateReadable(rollDate)} UTC, LP contributions to either the{" "}
              {rollFromTokenName} or the {rollToTokenName} are considered
              equally. What this means is that rewards are granted pro-rata as:
              (your USD contribution) / (total {rollFromTokenName} liquidity +
              total {rollToTokenName} liquidity). After{" "}
              {getDateReadable(rollDate)} UTC, only LP contributions in the{" "}
              {rollToTokenName} pool will count towards liquidity mining
              rewards.
            </Typography>
          </>
        )}
        <br></br>
        <br></br>
        {rewardToken.length > 0 ? (
          <Typography>
            <strong>Tokens eligible for liquidity mining:</strong>{" "}
            {timeUntilRoll
              ? isRolled
                ? rollToTokenName
                : `${rollFromTokenName} + ${rollToTokenName}`
              : rollFromTokenName}
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
                        {rewardObj.token === "UMA" && (
                          <Tooltip
                            placement="top"
                            title="This is a rough estimation which changes based on relative value locked vs all eligible contracts. Actual payout may differ significantly. Click to learn more."
                          >
                            <span>
                              <u>
                                <i>
                                  <a
                                    href="https://twitter.com/UMAprotocol/status/1324199135080148993"
                                    target="_blank"
                                  >
                                    Estimated
                                  </a>
                                </i>
                              </u>{" "}
                            </span>
                          </Tooltip>
                        )}
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
        ) : (
          <Typography>
            <strong>This token is not currently eligible for rewards</strong>
          </Typography>
        )}
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
