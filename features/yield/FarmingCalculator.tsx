import {
  Box,
  TextField,
  Typography,
  Grid,
  Menu,
  MenuItem,
  Button,
} from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { useState, useEffect } from "react";
import styled from "styled-components";
import EmpState from "../../containers/EmpState";
import Balancer from "../../containers/Balancer";

const FormInput = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const YieldCalculator = () => {
  const { empState } = EmpState.useContainer();
  const { usdPrice, pool } = Balancer.useContainer();
  const [yUSDAdded, setyUSDAdded] = useState<string | null>("1000");
  const [USDCAdded, setUSDCAdded] = useState<string | null>("1000");

  const [yieldAmount, setYieldAmount] = useState<string | null>(null);

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
    const totalValueAddedToPool =
      Number(USDCAdded) + Number(yUSDAdded) * Number(usdPrice);

    const fracLiquidityProvided =
      totalValueAddedToPool / Number(pool.liquidity);
    const weeklyUMARewarded = 25000;
    return (fracLiquidityProvided * weeklyUMARewarded).toFixed(4);
  };

  // Update the yield whenever the parameters change.
  useEffect(() => {
    setYieldAmount(calculateYield());
  }, [usdPrice, yUSDAdded, USDCAdded]);

  return (
    <span>
      <Typography variant="h5">$UMA Farming calculator</Typography>
      <Typography>
        During the liquidity mining program 25k $UMA rewards will be paid out to
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
            <Grid item md={4} sm={12} xs={12}>
              <Box pt={1} textAlign="center">
                <Typography variant="h6">
                  Weekly <strong>$UMA</strong> mining rewards: {yieldAmount}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </form>
        <Typography>
          <strong>Note: </strong>Providing liquidity on Balancer will also yield
          BAL rewards. To calculate your BAL rewards use{" "}
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
    </span>
  );
};

export default YieldCalculator;
