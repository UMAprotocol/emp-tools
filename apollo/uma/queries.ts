import { gql } from "@apollo/client";

export const ACTIVE_POSITIONS = gql`
  query activePositions {
    financialContracts {
      id
      positions(first: 1000, where: { collateral_gt: 0 }) {
        collateral
        tokensOutstanding
        sponsor {
          id
        }
      }
    }
  }
`;
