import { useRouter } from "next/router";
import styled from "styled-components";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { useState, useEffect } from "react";

import InputBase from "@material-ui/core/InputBase";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import ListItemText from "@material-ui/core/ListItemText";

const BootstrapInput = withStyles((theme) => ({
  root: {
    "label + &": {
      marginTop: theme.spacing(3),
      // paddingTop: theme.spacing(3),
    },
    position: "relative",
    transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
    backgroundColor: "rgba(255, 255, 255, 0.09)",
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
  },
  input: {
    display: "flex",
    // paddingTop: theme.spacing(3),
    paddingLeft: "16px",
    alignItems: "center",
  },
}))(InputBase);

const useStyles = makeStyles((theme) => ({
  formControl: {
    // margin: theme.spacing(1),
    // minWidth: 360,
    width: "100%",
  },
  itemDesc: {
    // width: 420,
    "& > p": {
      whiteSpace: "normal",
    },
  },
}));

const Manager = () => {
  const [method, setMethod] = useState("create");
  const classes = useStyles();

  const handleChange = (e) => setMethod(e.target.value);

  return (
    <Box my={2}>
      <Typography variant="h5">Manage Position</Typography>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Actions</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={method}
          onChange={handleChange}
          input={<BootstrapInput />}
        >
          <MenuItem value={"create"}>
            <ListItemText
              primary="Create"
              secondary="Mint new synthetic tokens."
              className={classes.itemDesc}
            />
          </MenuItem>
          <MenuItem value={"deposit"}>
            <ListItemText
              primary="Deposit"
              secondary="Deposit additional collateral."
              className={classes.itemDesc}
            />
          </MenuItem>
          <MenuItem value={"withdraw"}>
            <ListItemText
              primary="Withdraw"
              secondary="Withdraw excess collateral."
              className={classes.itemDesc}
            />
          </MenuItem>
          <MenuItem value={"redeem"}>
            <ListItemText
              primary="Redeem"
              secondary="Withdraw excess collateral."
              className={classes.itemDesc}
            />
          </MenuItem>
          <MenuItem value={"transfer"}>
            <ListItemText
              primary="Transfer"
              secondary="Transfer a token sponsor position."
              className={classes.itemDesc}
            />
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default Manager;
