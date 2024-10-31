# tapV2-subgraph
Subgraph made for the new version of tap

# Timeline Aggregation Protocol Subgraph (TAP Subgraph) 


## Build and deploy

Be sure to check `package.json` where the yarn commands are defined.

```sh
# Install dependencies
yarn
# Generates subgraph.yaml from the template depending on the network
yarn prepare:[network]
# Build AssemblyScript types using `schema.graphql` and `subgraph.yaml`.
yarn codegen
# Build subgraph
yarn build
# Create a subgraph name locally
yarn create-local
# Deploy subgraph code under name created above
yarn deploy-local
```

At this point, the subgraph will immediately start indexing. You will be able to query
the subgraph immediately on port 8000 (but it will be past data until reaching chain
head, of course).

## Development flow

`yarn create-local` needs to be executed only once. Thereafter, you can replace the
subgraph code under the created name.

### Filling the subgraph.yaml

Since the subgraph could be deployed to several other networks, we are using a template which can be filled depending on the network it needs to be at.
At the moment we only support `arbitrum-sepolia` and `sepolia`.
To do so you must run the following command.
```sh
 yarn prepare:[network]
```
After this a subgraph.yaml will be filled and can go on with the next commands

```sh
yarn codegen  # Only if subgraph.yaml or schema.graphql changed.
yarn build
yarn deploy-local
```

It will stop indexing the old code, and start the new one in its place.

