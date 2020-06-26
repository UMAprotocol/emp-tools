import App from "next/app";
import Head from "next/head";

import { WithStylingProviders } from "../utils/styling";
import Connection from "../containers/Connection";
import Contract from "../containers/Contract";
import EmpAddress from "../containers/EmpAddress";
import EmpState from "../containers/EmpState";
import Collateral from "../containers/Collateral";

interface IProps {
  children: React.ReactNode;
}

const WithStateContainerProviders = ({ children }: IProps) => (
  <Connection.Provider>
    <EmpAddress.Provider>
      <Contract.Provider>
        <EmpState.Provider>
          <Collateral.Provider>{children}</Collateral.Provider>
        </EmpState.Provider>
      </Contract.Provider>
    </EmpAddress.Provider>
  </Connection.Provider>
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
