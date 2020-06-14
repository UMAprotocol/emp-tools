import { ThemeProvider as SCThemeProvider } from "styled-components";
import {
  createMuiTheme,
  ThemeProvider as MuiThemeProvider,
  StylesProvider,
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
    primary: { main: "#AAA" },
    secondary: { main: "#ff4a4a" },
  },
  typography: {
    fontFamily: [
      `IBM Plex Mono`,
      `-apple-system`,
      `BlinkMacSystemFont`,
      `"Segoe UI"`,
      `sans-serif`,
    ].join(","),
  },
});

interface IProps {
  children: React.ReactNode;
}

export const WithStylingProviders = ({ children }: IProps) => (
  <SCThemeProvider theme={scTheme}>
    <MuiThemeProvider theme={muiTheme}>
      <StylesProvider injectFirst>
        <CssBaseline />
        {children}
      </StylesProvider>
    </MuiThemeProvider>
  </SCThemeProvider>
);
