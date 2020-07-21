import styled from "styled-components";
import { Container, Box, Tab, Tabs } from "@material-ui/core";
import { useRouter } from "next/router";

import Header from "./Header";
import EmpSelector from "../emp-selector/EmpSelector";
import Footer from "./Footer";

const StyledTabs = styled(Tabs)`
  & .MuiTabs-flexContainer {
    border-bottom: 1px solid #999;
  }
  & .Mui-selected {
    font-weight: bold;
  }
  padding-bottom: 2rem;
`;

interface IProps {
  children: React.ReactNode;
}

interface RouteMap {
  [key: string]: number;
}

const ROUTE_TAB_MAP: RouteMap = {
  "/": 0,
  "/manage-position": 1,
  "/all-positions": 2,
  "/weth": 3,
  "/yield-calculator": 4,
};

export default function Layout({ children }: IProps) {
  const router = useRouter();

  return (
    <Container maxWidth={"md"}>
      <Box py={4}>
        <Header />
        <EmpSelector />
        <StyledTabs value={ROUTE_TAB_MAP[router.pathname]}>
          <Tab
            label="General Info"
            disableRipple
            onClick={() => router.push("/")}
          />
          <Tab
            label="Manage Position"
            disableRipple
            onClick={() => router.push("/manage-position")}
          />
          <Tab
            label="All Positions"
            disableRipple
            onClick={() => router.push("/all-positions")}
          />
          <Tab
            label="Wrap/Unwrap WETH"
            disableRipple
            onClick={() => router.push("/weth")}
          />
          <Tab
            label="Yield Calculator"
            disableRipple
            onClick={() => router.push("/yield-calculator")}
          />
        </StyledTabs>

        {children}
      </Box>
      <Footer />
    </Container>
  );
}
