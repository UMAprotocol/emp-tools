import assert from "assert";
import { gql } from "@apollo/client";

export const FindPairByTokens = gql`
  query findPairByTokens($token0: String!, $token1: String!) {
    pairs(where: { token0: $token0, token1: $token1 }) {
      id
      token0 {
        id
      }
      token1 {
        id
      }
      token1Price
      token0Price
      totalSupply
      reserve0
      reserve1
    }
  }
`;

export const GetPair = gql`
  query getPair($id: String!) {
    pair(id: $id) {
      id
      token0 {
        id
      }
      token1 {
        id
      }
      token1Price
      token0Price
      totalSupply
      reserve0
      reserve1
    }
  }
`;
