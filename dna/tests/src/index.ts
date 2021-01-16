import { Orchestrator, Config, InstallAgentsHapps } from "@holochain/tryorama";
import path from "path";
import {
  ApolloClient,
  ApolloLink,
  gql,
  InMemoryCache,
  Observable,
  DefaultOptions,
} from "@apollo/client/core";
import { print, stripIgnoredCharacters } from "graphql";

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

orchestrator.registerScenario("create an entry and get it", async (s, t) => {
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

  const defaultOptions: DefaultOptions = {
    watchQuery: {
      fetchPolicy: "no-cache",
      errorPolicy: "ignore",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  };

  const client = new ApolloClient({
    link: holochainLink,
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
  });

  // 🌈
  // List lists
  let queryLists = gql`
    query Lists {
      lists {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `;
  let listList = await client.query({
    query: queryLists,
  });
  t.ok(listList, "List lists");
  console.log(JSON.stringify(listList, undefined, 2));

  // 🌈
  //Create list1
  let mutation = gql`
    mutation CreateList1($input: CreateListInput!) {
      createList(input: $input) {
        listEdge {
          node {
            id
            name
          }
        }
      }
    }
  `;
  let variables = {
    input: { name: "Sports" },
  };
  let list1 = await client.mutate({
    mutation: mutation,
    variables: variables,
  });
  t.ok(list1, `Create list 1`);
  let list1Id = list1.data.createList.listEdge.node.id;
  console.log(JSON.stringify(list1, undefined, 2));
  await sleep(500);

  // 🌈
  // Create list2
  mutation = gql`
    mutation CreateList2($input: CreateListInput!) {
      createList(input: $input) {
        listEdge {
          node {
            id
            name
          }
        }
      }
    }
  `;
  variables = {
    input: {
      name: "Music",
    },
  };
  let list2 = await client.mutate({
    mutation: mutation,
    variables: variables,
  });
  t.ok(list2, `Create list 2`);
  let list2Id = list2.data.createList.listEdge.node.id;
  console.log(JSON.stringify(list2, undefined, 2));
  await sleep(500);

  // 🌈
  // List lists
  let listList2 = await client.query({
    query: queryLists,
  });
  t.ok(listList2, "List lists again");
  console.log(JSON.stringify(listList2, undefined, 2));

  // // 🌈
  // // Create list2 item1
  mutation = gql`
    mutation CreateItem1($input: CreateItemInput!) {
      createItem(input: $input) {
        item {
          id
          description
          done
        }
      }
    }
  `;
  let createItemVars = {
    input: {
      listId: list2Id,
      description: "Do a lot of stuff tomorrow.",
    },
  };
  let item1 = await client.mutate({
    mutation: mutation,
    variables: createItemVars,
  });
  t.ok(list2, `Create item 1, list 2`);
  let item1Id = item1.data.createItem.item.id;
  console.log(JSON.stringify(item1, undefined, 2));
  await sleep(500);

  // 🌈
  // Create list2 item2
  mutation = gql`
    mutation CreateItem2($input: CreateItemInput!) {
      createItem(input: $input) {
        item {
          id
          description
          done
        }
      }
    }
  `;
  createItemVars = {
    input: {
      listId: list2Id,
      description: "And the day after, do even more!",
    },
  };
  let item2 = await client.mutate({
    mutation: mutation,
    variables: createItemVars,
  });
  t.ok(list2, `Create item 2, list 2`);
  let item2Id = item2.data.createItem.item.id;
  console.log(JSON.stringify(item2, undefined, 2));
  await sleep(500);

  // 🌈
  // List items - list 2
  let queryList2Items = gql`
   query List2Items {
      items(id: "${list2Id}") {
        edges {
          node {
            id
            description
            done
          }
        }
      }
   }
  `;
  let node = await client.query({
    query: queryList2Items,
  });
  t.ok(node, "List items - list 2");
  console.log(JSON.stringify(node, undefined, 2));

  // 🌈
  // Delete one list2 item
  mutation = gql`
    mutation DeleteItem($input: DeleteItemInput!) {
      deleteItem(input: $input) {
        item {
          id
          description
          done
        }
      }
    }
  `;
  let deleteItemVars = {
    input: {
      id: item1Id,
    },
  };
  let deletedItem = await client.mutate({
    mutation: mutation,
    variables: deleteItemVars,
  });
  t.ok(list2, `Delete item, list 2`);
  console.log(JSON.stringify(deletedItem, undefined, 2));
  await sleep(500);

  // 🌈
  // List items - list 2
  node = await client.query({
    query: queryList2Items,
  });
  t.ok(node, "List items - list 2");
  console.log(JSON.stringify(node, undefined, 2));

  // 🌈
  // Update list2 item2
  mutation = gql`
    mutation UpdateItem($input: UpdateItemInput!) {
      updateItem(input: $input) {
        item {
          id
          description
          done
        }
      }
    }
  `;
  let updateItemVars = {
    input: {
      id: item2Id,
      description:
        "Has this text been updated? Possibly, probably, yes, maybe?",
      done: true,
    },
  };
  item2 = await client.mutate({
    mutation: mutation,
    variables: updateItemVars,
  });
  t.ok(list2, `Update item 2, list 2`);
  console.log(JSON.stringify(item2, undefined, 2));
  await sleep(500);

  // 🌈
  // Toggle done list2 item2
  mutation = gql`
    mutation ToggleDone($input: ToggleItemDoneInput!) {
      toggleItemDone(input: $input) {
        item {
          id
          description
          done
        }
      }
    }
  `;
  let toggleItemDoneVars = {
    input: {
      id: item2Id,
    },
  };
  item2 = await client.mutate({
    mutation: mutation,
    variables: toggleItemDoneVars,
  });
  t.ok(item2, `Toggle done item 2, list 2`);
  console.log(JSON.stringify(item2, undefined, 2));
  await sleep(500);

  // 🌈
  // List items - list 2
  node = await client.query({
    query: queryList2Items,
  });
  t.ok(node, "List items - list 2");
  console.log(JSON.stringify(node, undefined, 2));

  // // 🌈
  // // Test node queries
  // let queryNodes = gql`
  //   query NodeQuery($id: ID!, $id2: ID!, $id3: ID!) {
  //     first: node(id: $id) {
  //       id
  //       ... on List {
  //         id
  //         name
  //       }
  //     }
  //     second: node(id: $id2) {
  //       id
  //       ... on List {
  //         id
  //         name
  //       }
  //     }
  //     third: node(id: $id3) {
  //       id
  //       ... on Item {
  //         id
  //         description
  //         done
  //       }
  //     }
  //   }
  // `;
  // node = await client.query({
  //   query: queryNodes,
  //   variables: {
  //     id: list1Id,
  //     id2: list2Id,
  //     id3: item2Id,
  //   },
  // });
  // t.ok(node, "Node queries - list 2");
  // console.log(JSON.stringify(node, undefined, 2));

  await sleep(3000);
});

orchestrator.run();
