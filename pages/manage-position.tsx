import styled from "styled-components";
import { Container, Box, Tab, Tabs } from "@material-ui/core";
import { useRouter } from "next/router";

import Header from "../features/core/Header";
import ManagePosition from "../features/manage-position/ManagePosition";
import EmpSelector from "../features/emp-selector/EmpSelector";

const StyledTabs = styled(Tabs)`
  & .MuiTabs-flexContainer {
    border-bottom: 1px solid #999;
  }
  & .Mui-selected {
    font-weight: bold;
  }
  padding-bottom: 2rem;
`;

export default function Index() {
  const router = useRouter();

  return (
    <Container maxWidth={"md"}>
      <Box py={4}>
        <Header />
        <EmpSelector />
        <StyledTabs value={1}>
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
        <ManagePosition />
      </Box>
      <Box py={4} textAlign="center">
        <a
          href="https://vercel.com/?utm_source=uma%2Femp-tools"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/powered-by-vercel.svg" alt="Powered by Vercel" />
        </a>
      </Box>
    </Container>
  );
}
