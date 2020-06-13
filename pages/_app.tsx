import App, { Container } from "next/app";
import Head from "next/head";
import { ThemeProvider as SCThemeProvider } from "styled-components";
import {
  createMuiTheme,
  ThemeProvider as MuiThemeProvider,
} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

const scTheme = {
  // colors: {
  //   primary: "#fab127",
  // },
};

const muiTheme = createMuiTheme({
  palette: {
    type: "dark",
    primary: { main: "#333333" },
    secondary: { main: "#cccccc" },
  },
});

export default class MyApp extends App {
  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <Container>
        <Head>
          <title>emp-tools</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
        </Head>
        <SCThemeProvider theme={scTheme}>
          <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <Component {...pageProps} />
          </MuiThemeProvider>
        </SCThemeProvider>
      </Container>
    );
  }
}
