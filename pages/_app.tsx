import App from "next/app";
import Head from "next/head";

import "../utils/global.css";

import { WithStylingProviders } from "../utils/styling";
import Connection from "../containers/Connection";
import EmpContract from "../containers/EmpContract";
import EmpAddress from "../containers/EmpAddress";
import SelectedContract from "../containers/SelectedContract";
import EmpState from "../containers/EmpState";
import EmpSponsors from "../containers/EmpSponsors";
import Collateral from "../containers/Collateral";
import Token from "../containers/Token";
import Position from "../containers/Position";
import Totals from "../containers/Totals";
import PriceFeed from "../containers/PriceFeed";
import WethContract from "../containers/WethContract";
import Etherscan from "../containers/Etherscan";
import Balancer from "../containers/Balancer";
import DvmContracts from "../containers/DvmContracts";
import DvmState from "../containers/DvmState";
import DevMining from "../containers/DevMining";
import Uniswap from "../containers/Uniswap";
import ContractList from "../containers/ContractList";

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
          <WethContract.Provider>
            <EmpState.Provider>
              <Token.Provider>
                <Collateral.Provider>
                  <PriceFeed.Provider>
                    <EmpSponsors.Provider>
                      <Totals.Provider>
                        <Etherscan.Provider>
                          <Position.Provider>
                            <Balancer.Provider>
                              <DvmContracts.Provider>
                                <DvmState.Provider>
                                  <DevMining.Provider>
                                    <ContractList.Provider>
                                      <SelectedContract.Provider>
                                        {children}
                                      </SelectedContract.Provider>
                                    </ContractList.Provider>
                                  </DevMining.Provider>
                                </DvmState.Provider>
                              </DvmContracts.Provider>
                            </Balancer.Provider>
                          </Position.Provider>
                        </Etherscan.Provider>
                      </Totals.Provider>
                    </EmpSponsors.Provider>
                  </PriceFeed.Provider>
                </Collateral.Provider>
              </Token.Provider>
            </EmpState.Provider>
          </WethContract.Provider>
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
