import { gql } from "@apollo/client";

export const EMP_DATA = gql`
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
      liquidations {
        sponsor {
          id
        }
        liquidationId
        liquidator {
          address
        }
        disputer {
          address
        }
        tokensLiquidated
        lockedCollateral
        liquidatedCollateral
        status
        events {
          __typename
          timestamp
          tx_hash
        }
      }
    }
  }
`;
