import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
} from "@apollo/client";

const umaLinkKovan = new HttpLink({
  uri:
    "https://api.thegraph.com/subgraphs/name/nicholaspai/kovan-contracts-staging",
});
const umaLinkMainnet = new HttpLink({
  uri:
    "https://api.thegraph.com/subgraphs/name/nicholaspai/mainnet-contracts-staging",
});
const balancerLink = new HttpLink({
  uri: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer",
});

const uniswapV2Link = new HttpLink({
  uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
});
// Uses ApolloLink's directional composition logic, docs: https://www.apollographql.com/docs/react/api/link/introduction/#directional-composition
const umaLinks = ApolloLink.split(
  (operation) => operation.getContext().clientName === "UMA42",
  umaLinkKovan,
  umaLinkMainnet
);

const otherLinks = ApolloLink.split(
  (operation) => operation.getContext().clientName === "BALANCER",
  balancerLink,
  uniswapV2Link
);
export const client = new ApolloClient({
  cache: new InMemoryCache(),
  // We handle more than 2 links by composing directional composition, idea from: https://www.loudnoises.us/next-js-two-apollo-clients-two-graphql-data-sources-the-easy-way/
  link: ApolloLink.split(
    (operation) => operation.getContext().clientName.includes("UMA"),
    umaLinks,
    otherLinks
  ),
});
