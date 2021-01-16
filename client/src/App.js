import React from "react";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import { brown } from "@material-ui/core/colors";
import CssBaseline from "@material-ui/core/CssBaseline";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Lists from "./routes/Lists";
import Items from "./routes/Items";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    backgroundColor: brown[50],
  },
  card: {
    margin: 5,
  },
  buttonBase: {
    width: "100%",
    textAlign: "left",
    justifyContent: "start",
  },
  gridList: {
    width: "100%",
  },
}));

export default function App() {
  const classes = useStyles();

  return (
    <>
      <CssBaseline />

      <Box pt={8} pb={4} className={classes.root}>
        <Container maxWidth="sm" p={40}>
          <Router>
            <Switch>
              <Route path="/items">
                <Items />
              </Route>
              <Route path="/">
                <Lists />
              </Route>
            </Switch>
          </Router>
        </Container>
      </Box>
    </>
  );
}
