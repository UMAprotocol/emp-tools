import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import styled from "styled-components";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";

const Title = styled.h1`
  // color: ${({ theme }) => theme.colors.primary};
  font-size: 50px;
`;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function Index() {
  const classes = useStyles();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            EMP Tools
          </Typography>
          <Button color="inherit">Connect</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <Title>EMP Tools</Title>
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Next.js v4-beta example
          </Typography>
        </Box>
      </Container>
    </>
  );
}
