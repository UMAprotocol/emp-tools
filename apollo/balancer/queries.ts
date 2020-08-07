import { gql } from "@apollo/client";

export const TOKENS = gql`
  query tokenOverview($tokenId: String) {
    tokenPrices(where: { id: $tokenId }) {
      price
      poolTokenId
    }
  }
`;

// TODO: I made POOL a function because I couldn't figure out how to pass in mutations of the form [Bytes!], which `tokensList` expects.
export const POOL = (stringifiedTokenList: String) => gql`
  query poolOverview {
    pools(where: {tokensList: ${stringifiedTokenList}}) {
      swapFee
      liquidity
      totalSwapVolume
      tokens {
        address
        balance
      }
      joinsCount
      exitsCount
      swapsCount
      totalShares
      shares(first:1000, where: { balance_gt: 0}) {
        userAddress {
          id
        }
        balance
      }
    }
  }
`;
