import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
} from "@apollo/client";

const umaLink = new HttpLink({
  uri: "https://api.thegraph.com/subgraphs/name/protofire/uma",
});
const balancerLink = new HttpLink({
  uri: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer",
});

export const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/protofire/uma",
  cache: new InMemoryCache(),
  link: ApolloLink.split(
    // Uses ApolloLink's directional composition logic, docs: https://www.apollographql.com/docs/react/api/link/introduction/#directional-composition
    (operation) => operation.getContext().clientName === "UMA",
    umaLink,
    balancerLink
  ),
});
