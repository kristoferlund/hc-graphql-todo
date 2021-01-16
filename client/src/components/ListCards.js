import React from "react";
import { useHistory } from "react-router-dom";

import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { List as ListIcon } from "@material-ui/icons";
import ButtonBase from "@material-ui/core/ButtonBase";

const useStyles = makeStyles((theme) => ({
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

let ListCard = (props) => {
  const { list } = props;
  const classes = useStyles();
  const history = useHistory();

  return (
    <Card className={classes.card}>
      <ButtonBase
        className={classes.buttonBase}
        onClick={(event) => {
          history.push(`/items/${list.id}`);
        }}
      >
        <CardContent>
          <ListIcon fontSize="large" color="secondary" />
          <Typography variant="h5" component="h2">
            {list.name}
          </Typography>
          <Typography color="textSecondary">23 Tasks</Typography>
        </CardContent>
      </ButtonBase>
    </Card>
  );
};

export default function ListCards(props) {
  const { lists } = props;
  const classes = useStyles();
  return (
    <GridList
      className={classes.gridList}
      cols={3}
      spacing={4}
      cellHeight="auto"
    >
      {lists.edges.map((edge) => (
        <GridListTile key={edge.node.id} cols={1}>
          <ListCard key={edge.node.id} list={edge.node} />
        </GridListTile>
      ))}
    </GridList>
  );
}
