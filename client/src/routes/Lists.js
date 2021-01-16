import React from "react";
import { useQuery } from "@apollo/client";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Skeleton from "@material-ui/lab/Skeleton";
import Grid from "@material-ui/core/Grid";

import AddList from "../components/AddList";
import ListCards from "../components/ListCards";

import { LISTS_QUERY } from "../graphql/queries";

const useStyles = makeStyles((theme) => ({
  grid: {
    width: "100%",
    margin: 0,
  },
}));

export default function Lists() {
  const { loading, error, data } = useQuery(LISTS_QUERY);

  const classes = useStyles();

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Lists
      </Typography>
      {loading ? (
        <Grid container justify="center" spacing={2} className={classes.grid}>
          {[0, 1, 2].map((value) => (
            <Grid key={value} item>
              <Skeleton variant="rect" width={168} height={125} />
            </Grid>
          ))}
        </Grid>
      ) : null}

      {error ? <div>Error!</div> : null}
      {data ? <ListCards lists={data.lists} /> : null}
      <Box display="flex" flexDirection="row-reverse" p={1} m={1}>
        <AddList />
      </Box>
    </>
  );
}
