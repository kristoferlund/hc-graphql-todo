import React from "react";

import { useQuery, useMutation } from "@apollo/client";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

import {
  LIST_ITEMS_QUERY,
  TOGGLE_ITEM_DONE_MUTATION,
  DELETE_ITEM_MUTATION,
} from "../graphql/queries";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
  itemDone: {
    textDecoration: "line-through",
  },
}));

const Item = (props) => {
  const { listId, itemId, description, done } = props;

  const [toggleItemDone] = useMutation(TOGGLE_ITEM_DONE_MUTATION);
  const [deleteItem] = useMutation(DELETE_ITEM_MUTATION, {
    update(cache, { data }) {
      const prev = cache.readQuery({
        query: LIST_ITEMS_QUERY,
        variables: { id: listId },
      });
      const newItemList = prev.items.edges.filter(
        (edge) => edge.node.id !== itemId
      );
      cache.writeQuery({
        query: LIST_ITEMS_QUERY,
        variables: { id: listId },
        data: {
          items: {
            __typename: "ItemConnection",
            edges: newItemList,
          },
        },
      });
    },
  });

  const classes = useStyles();
  const itemClassname = clsx({
    [classes.itemDone]: done,
  });

  const handleCheckboxClick = () => {
    toggleItemDone({
      variables: {
        input: {
          id: itemId,
        },
      },
    });
  };
  const handleDeleteClick = () => {
    deleteItem({
      variables: {
        input: {
          id: itemId,
        },
      },
    });
  };
  return (
    <ListItem key={true} role={undefined} dense button>
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={done}
          tabIndex={-1}
          disableRipple
          onClick={handleCheckboxClick}
        />
      </ListItemIcon>
      <ListItemText id={true} primary={description} className={itemClassname} />
      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="delete" onClick={handleDeleteClick}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default function ItemList(props) {
  const { listId } = props;

  const { error, data } = useQuery(LIST_ITEMS_QUERY, {
    variables: { id: listId },
  });

  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      {error ? (
        <Box p={2}>
          <Typography variant="body1">Error!</Typography>
        </Box>
      ) : null}
      {data && data.items.edges.length > 0 ? (
        <List>
          {data.items.edges.map((edge) => (
            <Item
              listId={listId}
              itemId={edge.node.id}
              description={edge.node.description}
              done={edge.node.done}
            />
          ))}
        </List>
      ) : null}
    </Paper>
  );
}
