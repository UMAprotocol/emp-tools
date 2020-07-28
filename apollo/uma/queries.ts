import { gql } from "@apollo/client";

export const ACTIVE_POSITIONS = gql`
  query activePositions {
    financialContracts {
      id
      positions(where: { collateral_gt: 0 }) {
        collateral
        tokensOutstanding
        withdrawalRequestPassTimestamp
        withdrawalRequestAmount
        transferPositionRequestPassTimestamp
        liquidations {
          id
        }
        sponsor {
          id
        }
      }
    }
  }
`;
