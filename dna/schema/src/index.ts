import { Orchestrator, Config, InstallAgentsHapps } from "@holochain/tryorama";
import path from "path";
import {
  ApolloClient,
  ApolloLink,
  gql,
  InMemoryCache,
  Observable,
} from "@apollo/client/core";
import {
  print,
  getIntrospectionQuery,
  buildClientSchema,
  printSchema,
  stripIgnoredCharacters,
} from "graphql";

import fs from "fs";

const conductorConfig = Config.gen();

const storageDna = path.join(__dirname, "../../todo.dna.gz");

const installation: InstallAgentsHapps = [
  // agent 0
  [
    // happ 0
    [storageDna],
  ],
];

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(() => resolve(true), ms));

const orchestrator = new Orchestrator();

orchestrator.registerScenario("Generete schema file", async (s, t) => {
  const [alice] = await s.players([conductorConfig]);
  const [[alice_common]] = await alice.installAgentsHapps(installation);

  const serializeQuery = (query) => {
    query = print(query);
    query = stripIgnoredCharacters(query);
    query = query.replace(/"/g, '\\"');
    return query;
  };

  const holochainLink = new ApolloLink((operation) => {
    let query = serializeQuery(operation.query);
    let variables = JSON.stringify(operation.variables);

    return new Observable((observer) => {
      alice_common.cells[0]
        .call("todo", "graphql", {
          data: `{
            "query": "${query}",
            "variables": ${variables}
          }`,
        })
        .then((result) => {
          observer.next(JSON.parse(result.data));
          observer.complete();
        })
        .catch((e) => {
          console.log(JSON.stringify(e));
          observer.error(e);
        });
    });
  });

  const client = new ApolloClient({
    link: holochainLink,
    cache: new InMemoryCache(),
  });

  let result = await client.query({
    query: gql`
      ${getIntrospectionQuery()}
    `,
  });

  console.log("\n\n*** Fetch success, building schema.");

  const schema = buildClientSchema(result.data);

  console.log("\n\n*** Writing schema.graphql.");

  fs.writeFileSync("../schema.graphql", printSchema(schema));
  fs.writeFileSync("../schema.json", JSON.stringify(result.data, undefined, 2));
  console.log("\n\n*** 🎉 DONE!\n\n");
});

orchestrator.run();
