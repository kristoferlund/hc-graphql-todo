import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ApolloProvider } from "@apollo/client";

import HolochainClient from "./graphql/HolochainClient";

ReactDOM.render(
  <ApolloProvider client={HolochainClient}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
