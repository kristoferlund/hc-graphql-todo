# Holochain / GraphQL Todo Sample

This app was built to test integrating Holochain with the [Juniper GraphQL](https://github.com/graphql-rust/juniper) server library for Rust.

#### DNA

The DNA accepts queries on a single endpoint: `graphql`. See the [schema.graphql](./dna/schema.graphql) for available queries/mutations.

#### Client

The client is built on [React](https://reactjs.org/) and uses [Apollo Client](https://www.apollographql.com/docs/react/) / [Holochain Conductor API](https://github.com/holochain/holochain-conductor-api) to communicate with Holochain.

### Requirements

- Having run through [holochain RSM installation](https://github.com/holochain/holochain-dna-build-tutorial).
- Run all the steps described in this README.md inside the `nix-shell` of the `holochain` core repository.
- Have [`holochain-run-dna`](https://www.npmjs.com/package/@holochain-open-dev/holochain-run-dna) installed globally, and the `lair-keystore` described in its README as well.

### Docs

To generate the Zome API docs:

```bash
cd dna
cargo doc --open
```

### Building

```bash
cd dna
sh build.sh
```

### Testing

After having built the DNA:

```bash
cd dna/tests
npm install
npm test
```

### Run Holochain with DNA

After having built the DNA:

```bash
cd dna
sh run.sh
```

Now `holochain` will be listening at port `8888`;

Restart the command if it fails (flaky holochain start).

### Run client

```bash
cd client
yarn
yarn start
```

### Contributing

Yes, please! Raise an issue or post a pull request.

### License

MIT
