import { Box, TextField, Typography, Grid } from "@material-ui/core";
import { useState, useEffect } from "react";
import styled from "styled-components";

import Balancer from "../../containers/Balancer";

const Status = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Label = styled.span`
  color: #999999;
`;

const Link = styled.a`
  font-size: 14px;
`;

const BalancerData = () => {
  const { poolAddress, usdPrice, pool } = Balancer.useContainer();

  if (poolAddress !== null && usdPrice !== null && pool !== null) {
    const balancerPoolUrl = `https://pools.balancer.exchange/#/pool/${poolAddress}`;
    return renderComponent(
      balancerPoolUrl,
      `$${usdPrice.toFixed(4)}`,
      `$${pool.liquidity.toLocaleString()}`,
      `$${pool.totalSwapVolume.toLocaleString()}`,
      `$${pool.tokenBalanceEmp.toLocaleString()}`,
      `$${pool.tokenBalanceOther.toLocaleString()}`,
      `${pool.swapFee}%`,
      `${pool.swapsCount}`,
      `${pool.exitsCount}`,
      `${pool.joinsCount}`
    );
  } else {
    return renderComponent();
  }

  function renderComponent(
    balancerPoolUrl: string = "/",
    usdPrice: string = "",
    poolLiquidity: string = "",
    poolSwapVolume: string = "",
    poolBalanceToken: string = "",
    poolBalanceOther: string = "",
    poolSwapFee: string = "",
    poolSwapCount: string = "",
    poolExitsCount: string = "",
    poolJoinsCount: string = ""
  ) {
    return (
      <span>
        <Typography variant="h5" style={{ marginBottom: "10px" }}>
          yUSD Pool Metrics{" "}
          <Link
            href={balancerPoolUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            (Balancer)
          </Link>
        </Typography>
        <Status>
          <Label>Pool liquidity: </Label>
          {poolLiquidity}
        </Status>
        <Status>
          <Label>
            - <i>yUSD</i>:{" "}
          </Label>
          {poolBalanceToken}
        </Status>
        <Status>
          <Label>
            - <i>USDC</i>:{" "}
          </Label>
          {poolBalanceOther}
        </Status>
        <Status>
          <Label>Swap fee: </Label>
          {poolSwapFee}
        </Status>
        <Status>
          <Label>Current price: </Label>
          {usdPrice}
        </Status>
        <Status>
          <Label>Trade volume: </Label>
          {poolSwapVolume}
        </Status>
        <Status>
          <Label>Trade count: </Label>
          {poolSwapCount}
        </Status>
        <Status>
          <Label>Joins count: </Label>
          {poolJoinsCount}
        </Status>
        <Status>
          <Label>Exits count: </Label>
          {poolExitsCount}
        </Status>
      </span>
    );
  }
};

export default BalancerData;
