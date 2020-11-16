import { Box, TextField, Typography, Grid } from "@material-ui/core";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Balancer from "../../containers/Balancer";
import Token from "../../containers/Token";

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

// TODO update with best calculation based on dev mining stats
function LiquidityMiningV2() {
  return (
    <span>
      <Typography variant="h5">UMA Liquidity Mining</Typography>

      <br></br>
      <Typography>
        UMA liquidity mining program will be changing, and a new calculator is
        in the works. See UMA Medium post for more context about the upcoming
        changes&nbsp;
        <a
          href="https://medium.com/uma-project/uma-announces-developer-mining-6f6fe15d5604"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </a>
        .
      </Typography>
    </span>
  );
}
const FarmingCalculator = () => {
  const {
    getTokenPrice,
    getPoolDataForToken,
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
    if (Object.keys(WEEKLY_UMA_REWARDS).includes(tokenAddress)) {
      // Strip out rewards that have expired or have not started yet.
      const allRewards = WEEKLY_UMA_REWARDS[tokenAddress];
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
  }, [address, tokenAddress, rollFromTokenObj, rollFromTokenAddress]);

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
    return <LiquidityMiningV2 />;
  }
};

export default FarmingCalculator;
