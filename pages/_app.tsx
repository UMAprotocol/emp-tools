import App from "next/app";
import Head from "next/head";

import "../utils/global.css";

import { WithStylingProviders } from "../utils/styling";
import Connection from "../containers/Connection";
import EmpContract from "../containers/EmpContract";
import EmpAddress from "../containers/EmpAddress";
import EmpState from "../containers/EmpState";
import EmpSponsors from "../containers/EmpSponsors";
import EmpDeployed from "../containers/EmpDeployed";
import Collateral from "../containers/Collateral";
import Token from "../containers/Token";
import Position from "../containers/Position";
import Totals from "../containers/Totals";
import PriceFeed from "../containers/PriceFeed";
import WethContract from "../containers/WethContract";

import { ApolloProvider } from "@apollo/client";
import { client } from "../apollo/client";

interface IProps {
  children: React.ReactNode;
}

const WithStateContainerProviders = ({ children }: IProps) => (
  <ApolloProvider client={client}>
    <Connection.Provider>
      <EmpAddress.Provider>
        <EmpContract.Provider>
          <EmpDeployed.Provider>
            <WethContract.Provider>
              <EmpState.Provider>
                <EmpSponsors.Provider>
                  <Collateral.Provider>
                    <Token.Provider>
                      <Totals.Provider>
                        <PriceFeed.Provider>
                          <Position.Provider>{children}</Position.Provider>
                        </PriceFeed.Provider>
                      </Totals.Provider>
                    </Token.Provider>
                  </Collateral.Provider>
                </EmpSponsors.Provider>
              </EmpState.Provider>
            </WethContract.Provider>
          </EmpDeployed.Provider>
        </EmpContract.Provider>
      </EmpAddress.Provider>
    </Connection.Provider>
  </ApolloProvider>
);

export default class MyApp extends App {
  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles?.parentNode?.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <title>emp-tools</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,700;1,400&display=swap"
            rel="stylesheet"
          />
        </Head>

        <WithStylingProviders>
          <WithStateContainerProviders>
            <Component {...pageProps} />
          </WithStateContainerProviders>
        </WithStylingProviders>
      </>
    );
  }
}
