import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import typeDefs from './graphql_schema.js';
import Category from './src/resolvers/category.js';
import Query from './src/resolvers/query.js';
import CategoryResult from './src/resolvers/category_result.js';
import AssetResult from './src/resolvers/asset_result.js';

const server = new ApolloServer({
    typeDefs,
    resolvers: {
        Category,
        Query,
        CategoryResult,
        AssetResult
    },
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 5000 },
});

console.log(`🚀  Server ready at: ${url}`);

