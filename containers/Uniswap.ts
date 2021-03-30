import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";

import { useApolloClient, ApolloClient } from "@apollo/client";
import { GetPair } from "../apollo/uniswap/queries";

import { findInfoByAddress } from "../constants/perpetuals";
import SelectedContract from "../containers/SelectedContract";

function call(client: any, query: any, variables: any) {
  return client.query({
    query,
    context: { clientName: "UNISWAP" },
    variables,
  });
}

function getPair() {
  const client = useApolloClient();
  const { address, isValid } = SelectedContract.useContainer();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    if (!address) return;
    if (!isValid) return;
    if (!client) return;
    try {
      const info = findInfoByAddress(address);
      setError(null);
      call(client, GetPair, { id: info.market.id })
        .then((result: any) => setData(result.data))
        .catch(setError)
        .finally(() => setLoading(false));
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, [address, client]);

  return {
    loading,
    data,
    error,
  };
}

export const UniswapGetPair = createContainer(getPair);
