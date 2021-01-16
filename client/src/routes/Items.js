import React from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@apollo/client";

import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/lab/Skeleton";
import Link from "@material-ui/core/Link";

import AddItem from "../components/AddItem";
import ItemList from "../components/ItemList";

import { LIST_QUERY } from "../graphql/queries";

export default function Items() {
  let location = useLocation();
  const listId = location.pathname.split("/").pop();
  const { loading, data } = useQuery(LIST_QUERY, {
    variables: { id: listId },
  });

  return (
    <>
      <Typography variant="h2" gutterBottom>
        {loading ? <Skeleton variant="text" width={350} height={80} /> : null}
        {data ? (
          <>
            <Link component={RouterLink} to="/" color="inherit">
              Lists
            </Link>{" "}
            / {data.list.name}
          </>
        ) : null}
      </Typography>
      <ItemList listId={listId} />
      <AddItem listId={listId} />
    </>
  );
}
