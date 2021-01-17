# Holochain / GraphQL Todo Sample

This app was built to test integrating [Holochain](https://holochain.org/) with the [Juniper GraphQL](https://github.com/graphql-rust/juniper) server library for Rust. Conclusion: It works great! No obvious performance loss or excessive memory consumption, even though that would have to be investigated more in detail. Juniper adds only ca 150 K to the final size of compiled DNA. Client development becomes really straightforward when Holochain can be acessed as a GraphQL endpoint. 

![vid](https://user-images.githubusercontent.com/9698363/104852924-adc0dc80-58fd-11eb-827c-eaa5fcb906ec.gif)

#### DNA

The DNA accepts queries on a single endpoint: `graphql`. See file [schema.graphql](./dna/schema.graphql) for available queries/mutations.

#### Client

The client is built on [React](https://reactjs.org/) / [Material UI](https://material-ui.com/) and uses [Apollo Client](https://www.apollographql.com/docs/react/) / [Holochain Conductor API](https://github.com/holochain/holochain-conductor-api) to communicate with Holochain.

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
