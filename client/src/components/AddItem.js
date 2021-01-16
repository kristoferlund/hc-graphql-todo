import React from "react";
import { useMutation } from "@apollo/client";

import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import FormControl from "@material-ui/core/FormControl";

import { LIST_ITEMS_QUERY, ADD_ITEM_MUTATION } from "../graphql/queries";

export default function AddItem(props) {
  const { listId } = props;

  const [input, setInput] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const textInput = React.useRef(null);

  React.useEffect(() => {
    if (!loading) {
      textInput.current.focus();
    }
  }, [loading]);

  const [addItem] = useMutation(ADD_ITEM_MUTATION, {
    onCompleted() {
      setLoading(false);
    },
    update(cache, { data }) {
      const prev = cache.readQuery({
        query: LIST_ITEMS_QUERY,
        variables: { id: listId },
      });
      cache.writeQuery({
        query: LIST_ITEMS_QUERY,
        variables: { id: listId },
        data: {
          items: {
            __typename: "ItemConnection",
            edges: [
              ...prev.items.edges,
              {
                __typename: "ItemEdge",
                node: data.createItem,
              },
            ],
          },
        },
      });
    },
  });

  const handleInputChange = (e) =>
    setInput({
      ...input,
      [e.currentTarget.name]: e.currentTarget.value,
    });

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      if (!loading) {
        setLoading(true);
        setInput({ newTodo: "" });
        addItem({
          variables: {
            input: {
              listId: listId,
              description: input.newTodo,
            },
          },
        });
      }
    }
  };

  return (
    <Box mt={2}>
      <Paper width="100%">
        <Box p={2}>
          <FormControl fullWidth>
            <TextField
              name="newTodo"
              label="New todo…"
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              value={input.newTodo}
              disabled={loading}
              inputRef={textInput}
              autoFocus
            />
          </FormControl>
        </Box>
      </Paper>
    </Box>
  );
}
