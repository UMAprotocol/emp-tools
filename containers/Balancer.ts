import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";

import { useQuery } from "@apollo/client";
import { TOKENS, POOL } from "../apollo/balancer/queries";

import Connection from "./Connection";
import Token from "./Token";
import { YIELD_TOKENS } from "../constants/yieldTokens";

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

interface yieldPair {
  [key: string]: string;
}

const useBalancer = () => {
  const { address, block$ } = Connection.useContainer();
  const { address: tokenAddress } = Token.useContainer();

  // Detect if selected token is a yield token, otherwise default to a yield token. This component
  // does not make sense for a non yield token.
  const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const defaultSwapTokenAddress = usdcAddress;

  const [selectedTokenAddress, setSelectedTokenAddress] = useState<
    string | null
  >(null);
  const [selectedSwapTokenAddress, setSelectedSwapTokenAddress] = useState<
    string | null
  >(null);
  const [poolTokenList, setPoolTokenList] = useState<string[] | null>(null);

  const [usdPrice, setUsdPrice] = useState<number | null>(null);
  const [poolAddress, setPoolAddress] = useState<string | null>(null);
  const [pool, setPool] = useState<PoolState | null>(null);
  const [shares, setShares] = useState<SharesState | null>(null);
  const [userShareFraction, setUserSharesFraction] = useState<number | null>(
    null
  );

  const {
    loading: tokenPriceLoading,
    error: tokenPriceError,
    data: tokenPriceData,
  } = useQuery(TOKENS, {
    skip: !selectedTokenAddress,
    context: { clientName: "BALANCER" },
    variables: { tokenId: selectedTokenAddress },
    pollInterval: 10000,
  });
  const { loading: poolLoading, error: poolError, data: poolData } = useQuery(
    POOL(JSON.stringify(poolTokenList)),
    {
      skip: !poolTokenList,
      context: { clientName: "BALANCER" },
      pollInterval: 10000,
    }
  );

  const initializeTokenAddress = () => {
    if (tokenAddress !== null) {
      setSelectedSwapTokenAddress(defaultSwapTokenAddress);
      const IS_YIELD_TOKEN = Object.keys(YIELD_TOKENS).includes(
        tokenAddress.toLowerCase()
      );
      if (IS_YIELD_TOKEN) {
        setSelectedTokenAddress(tokenAddress.toLowerCase());
        setPoolTokenList([
          YIELD_TOKENS[tokenAddress.toLowerCase()].token0.toLowerCase(),
          YIELD_TOKENS[tokenAddress.toLowerCase()].token1.toLowerCase(),
        ]);
      } else {
        const defaultTokenAddress = Object.keys(YIELD_TOKENS)[0].toLowerCase();
        setSelectedTokenAddress(defaultTokenAddress);
        setPoolTokenList([
          YIELD_TOKENS[defaultTokenAddress].token0.toLowerCase(),
          YIELD_TOKENS[defaultTokenAddress].token1.toLowerCase(),
        ]);
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
    if (!poolLoading && poolData) {
      const data = poolData.pools[0];
      if (!data) return null;

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

  // Use this function to get the token price for a specified yield token.
  const getTokenPrice = (_tokenAddress: string) => {
    const { loading, error, data } = useQuery(TOKENS, {
      skip: !_tokenAddress,
      context: { clientName: "BALANCER" },
      variables: { tokenId: _tokenAddress },
      pollInterval: 5000,
    });

    if (error) {
      console.error(`Apollo client failed to fetch graph data:`, error);
    }
    if (!loading && data) {
      const tokenData = data.tokenPrices[0];

      const usdPrice = Number(tokenData.price);
      return usdPrice;
    }
  };

  // Use this function get pool data for a specified yield token.
  const getPoolDataForToken = (_tokenAddress: string) => {
    const IS_YIELD_TOKEN = Object.keys(YIELD_TOKENS).includes(
      _tokenAddress.toLowerCase()
    );
    if (!IS_YIELD_TOKEN) {
      return;
    }

    const _swapTokenAddress = defaultSwapTokenAddress;
    const _poolTokens = YIELD_TOKENS[_tokenAddress.toLowerCase()];
    const poolTokens = [_poolTokens.token0, _poolTokens.token1];

    const { loading, error, data } = useQuery(
      POOL(JSON.stringify(poolTokens)),
      {
        skip: !poolTokens,
        context: { clientName: "BALANCER" },
        pollInterval: 5000,
      }
    );

    if (error) {
      console.error(`Apollo client failed to fetch graph data:`, error);
    }
    if (!loading && data && _tokenAddress && _swapTokenAddress) {
      const poolData = data.pools[0];

      const shareHolders: SharesState = {};
      poolData.shares.forEach((share: SharesQuery) => {
        if (!shareHolders[share.userAddress.id]) {
          shareHolders[share.userAddress.id] = share.balance;
        }
      });

      const pool = {
        exitsCount: Number(poolData.exitsCount),
        joinsCount: Number(poolData.joinsCount),
        swapsCount: Number(poolData.swapsCount),
        liquidity: Number(poolData.liquidity),
        swapFeePct: Number(poolData.swapFee) * 100,
        tokenBalanceEmp: Number(
          poolData.tokens.find(
            (t: PoolTokenQuery) => t.address === _tokenAddress
          ).balance
        ),
        tokenBalanceOther: Number(
          poolData.tokens.find(
            (t: PoolTokenQuery) => t.address === _swapTokenAddress
          ).balance
        ),
        totalSwapVolume: Number(poolData.totalSwapVolume),
      };

      let userSharesFraction = 0;
      if (address !== null && shareHolders !== null) {
        const user = Object.keys(shareHolders).find(
          (shareholder: string) => shareholder === address
        );
        const userShares = user ? Number(shareHolders[user]) : 0;
        const totalShares = Number(poolData.totalShares);
        if (totalShares > 0) {
          userSharesFraction = userShares / totalShares;
        }
      }

      return {
        shareHolders,
        pool,
        userSharesFraction,
      };
    }
  };

  // Change state when emp changes or when the graphQL data changes due to polling.
  useEffect(() => {
    initializeTokenAddress();
    queryTokenData();
    queryPoolData();
  }, [
    address,
    tokenAddress,
    tokenPriceLoading,
    tokenPriceData,
    poolData,
    poolLoading,
  ]);

  // get info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => {
        initializeTokenAddress();
        queryTokenData();
        queryPoolData();
      });
      return () => sub.unsubscribe();
    }
  }, [
    block$,
    tokenAddress,
    address,
    tokenPriceLoading,
    tokenPriceData,
    poolData,
    poolLoading,
  ]);

  return {
    pool,
    poolAddress,
    usdPrice,
    shares,
    userShareFraction,
    getPoolDataForToken,
    getTokenPrice,
  };
};

const Balancer = createContainer(useBalancer);

export default Balancer;
