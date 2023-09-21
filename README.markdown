[![NPM](https://img.shields.io/npm/v/@homebound/graphql-typescript-possible-types)](https://www.npmjs.com/package/@homebound/graphql-typescript-possible-types)

This is a [graphql-code-generator](https://graphql-code-generator.com/) plugin that generates types for implementating an Apollo-/`graphql`-style implementation in TypeScript.

## Overview

This plugin generates a [`possibleTypes` object](integration/graphql-types.ts) defining possible types which implement interfaces, [needed by Apollo](https://www.apollographql.com/docs/react/data/fragments/#defining-possibletypes-manually)

## Contributing

In order to develop changes for this package, follow these steps:

1. Make your desired changes in the [`src` directory](/src)

2. Adjust the example files under the [`integration` directory](/integration) to use your new feature.

3. Run `yarn build`, to create a build with your changes

4. Run `yarn graphql-codegen`, and verify the output in `graphql-types.ts` matches your expected output.
