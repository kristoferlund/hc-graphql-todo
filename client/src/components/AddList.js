import React from "react";
import clsx from "clsx";
import { useMutation } from "@apollo/client";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import CheckIcon from "@material-ui/icons/Check";

import { LISTS_QUERY, ADD_LIST_MUTATION } from "../graphql/queries";

const useStyles = makeStyles((theme) => ({
  buttonSuccess: {
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[700],
    },
  },
  buttonProgress: {
    color: green[500],
    marginLeft: 12,
  },
  iconCheck: {
    marginLeft: 12,
  },
}));

export default function AddList() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const [addList] = useMutation(ADD_LIST_MUTATION, {
    onCompleted() {
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
        }, 500);
      }, 300);
    },
    update(
      cache,
      {
        data: {
          createList: { listEdge },
        },
      }
    ) {
      const data = cache.readQuery({ query: LISTS_QUERY });
      cache.writeQuery({
        query: LISTS_QUERY,
        data: {
          lists: {
            __typename: "ListConnection",
            edges: [...data.lists.edges, listEdge],
          },
        },
      });
    },
  });

  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });

  // Clear save button state
  React.useEffect(() => {
    if (!open) {
      setSuccess(false);
    }
  }, [open, success]);

  const handleInputChange = (e) =>
    setInput({
      ...input,
      [e.currentTarget.name]: e.currentTarget.value,
    });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    if (!loading) {
      setLoading(true);
      setSuccess(false);
    }

    addList({
      variables: {
        input: { name: input.listname },
      },
    });
  };

  return (
    <div>
      <Fab color="primary" aria-label="add" onClick={handleClickOpen}>
        <AddIcon />
      </Fab>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Create list</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a memorable name. Just do it! Any old combination of letters
            will do.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="listname"
            label="Name"
            type="text"
            fullWidth
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={buttonClassname}
            disabled={loading}
            onClick={handleSave}
          >
            Save
            {loading && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
            {success && <CheckIcon size={24} className={classes.iconCheck} />}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
