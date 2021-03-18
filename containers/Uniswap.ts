import { useState, useEffect } from "react";

import { useQuery } from "@apollo/client";
import { PAIR } from "../apollo/uniswap/queries";

const useUniswap = ({ token0, token1 }: { token0: string; token1: string }) => {
  const { loading, error, data } = useQuery(PAIR, {
    context: { clientName: "UNISWAP" },
    variables: { token0, token1 },
    pollInterval: 60000,
  });

  return {
    loading,
    error,
    data,
  };
};

export default useUniswap;
