import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";

import { useQuery } from "@apollo/client";
import { TOKENS, POOL } from "../apollo/balancer/queries";

import Connection from "./Connection";
import Token from "./Token";

interface PoolState {
  exitsCount: number;
  joinsCount: number;
  swapsCount: number;
  liquidity: number;
  swapFeePct: number;
  tokenBalanceEmp: number;
  tokenBalanceOther: number;
  totalSwapVolume: number;
}

interface SharesState {
  [address: string]: string;
}

interface SharesQuery {
  userAddress: {
    id: string;
  };
  balance: string;
}
interface PoolTokenQuery {
  address: string;
  balance: string;
}

const YIELD_TOKENS = [
  "0x81ab848898b5ffD3354dbbEfb333D5D183eEDcB5", // Sep20
  "0xB2FdD60AD80ca7bA89B9BAb3b5336c2601C020b4", // Oct20
];

const useBalancer = () => {
  const { address, block$ } = Connection.useContainer();
  const { address: tokenAddress } = Token.useContainer();

  // Detect if selected token is a yield token, otherwise default to a yield token. This component
  // does not make sense for a non yield token.
  const defaultTokenAddress = YIELD_TOKENS[0].toLowerCase();
  const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const defaultSwapTokenAddress = usdcAddress;

  const [selectedTokenAddress, setSelectedTokenAddress] = useState<
    string | null
  >(defaultTokenAddress);
  const [selectedSwapTokenAddress, setSelectedSwapTokenAddress] = useState<
    string | null
  >(defaultSwapTokenAddress);
  const [poolTokenList, setPoolTokenList] = useState<string[] | null>([
    defaultTokenAddress,
    defaultSwapTokenAddress,
  ]);

  const [usdPrice, setUsdPrice] = useState<number | null>(null);
  const [poolAddress, setPoolAddress] = useState<string | null>(null);
  const [pool, setPool] = useState<PoolState | null>(null);
  const [shares, setShares] = useState<SharesState | null>(null);
  const [userShareFraction, setUserSharesFraction] = useState<number | null>(
    null
  );

  // Because apollo caches results of queries, we will poll/refresh this query periodically.
  // We set the poll interval to a very slow 5 seconds for now since the position states
  // are not expected to change much.
  // Source: https://www.apollographql.com/docs/react/data/queries/#polling
  const {
    loading: tokenPriceLoading,
    error: tokenPriceError,
    data: tokenPriceData,
  } = useQuery(TOKENS, {
    skip: !selectedTokenAddress,
    context: { clientName: "BALANCER" },
    variables: { tokenId: selectedTokenAddress },
    pollInterval: 5000,
  });
  const { loading: poolLoading, error: poolError, data: poolData } = useQuery(
    POOL(JSON.stringify(poolTokenList)),
    {
      skip: !poolTokenList,
      context: { clientName: "BALANCER" },
      pollInterval: 5000,
    }
  );

  const initializeTokenAddress = () => {
    if (tokenAddress !== null) {
      setSelectedSwapTokenAddress(defaultSwapTokenAddress);

      const IS_YIELD_TOKEN = YIELD_TOKENS.includes(tokenAddress);
      if (IS_YIELD_TOKEN) {
        setSelectedTokenAddress(tokenAddress.toLowerCase());
        setPoolTokenList([tokenAddress.toLowerCase(), defaultSwapTokenAddress]);
      } else {
        setSelectedTokenAddress(defaultTokenAddress);
        setPoolTokenList([defaultTokenAddress, defaultSwapTokenAddress]);
      }
    }
  };

  const queryTokenData = () => {
    if (tokenPriceError) {
      console.error(
        `Apollo client failed to fetch graph data:`,
        tokenPriceError
      );
    }
    if (!tokenPriceLoading && tokenPriceData) {
      const data = tokenPriceData.tokenPrices[0];
      setUsdPrice(Number(data.price));
      const _poolAddress = data.poolTokenId.split("-")[0];
      // const _tokenAddress = data.poolTokenId.split("-")[1];
      setPoolAddress(_poolAddress);
    }
  };

  const queryPoolData = () => {
    if (poolError) {
      console.error(`Apollo client failed to fetch graph data:`, poolError);
    }
    if (
      !poolLoading &&
      poolData &&
      selectedTokenAddress &&
      selectedSwapTokenAddress
    ) {
      const data = poolData.pools[0];

      const shareHolders: SharesState = {};
      data.shares.forEach((share: SharesQuery) => {
        if (!shareHolders[share.userAddress.id]) {
          shareHolders[share.userAddress.id] = share.balance;
        }
      });
      setShares(shareHolders);

      setPool({
        exitsCount: Number(data.exitsCount),
        joinsCount: Number(data.joinsCount),
        swapsCount: Number(data.swapsCount),
        liquidity: Number(data.liquidity),
        swapFeePct: Number(data.swapFee) * 100,
        tokenBalanceEmp: Number(
          data.tokens.find(
            (t: PoolTokenQuery) => t.address === selectedTokenAddress
          ).balance
        ),
        tokenBalanceOther: Number(
          data.tokens.find(
            (t: PoolTokenQuery) => t.address === selectedSwapTokenAddress
          ).balance
        ),
        totalSwapVolume: Number(data.totalSwapVolume),
      });

      if (address !== null && shares !== null) {
        const user = Object.keys(shareHolders).find(
          (shareholder: string) => shareholder === address
        );
        const userShares = user ? Number(shares[user]) : 0;
        const totalShares = Number(data.totalShares);
        if (totalShares > 0) {
          setUserSharesFraction(userShares / totalShares);
        }
      }
    }
  };

  // Change state when emp changes or when the graphQL data changes due to polling.
  useEffect(() => {
    initializeTokenAddress();
    queryTokenData();
    queryPoolData();
  }, [address, selectedTokenAddress, tokenAddress]);

  // get info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => {
        initializeTokenAddress();
        queryPoolData();
        queryTokenData();
      });
      return () => sub.unsubscribe();
    }
  }, [block$, address, selectedTokenAddress, tokenAddress]);

  return {
    pool,
    poolAddress,
    usdPrice,
    shares,
    userShareFraction,
  };
};

const Balancer = createContainer(useBalancer);

export default Balancer;
