import { gql } from "@apollo/client";

export const PAIR = gql`
  query pair($token0: String!, $token1: String!) {
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
