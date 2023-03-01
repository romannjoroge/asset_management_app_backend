import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import typeDefs from './graphql_schema.js';
import Category from './src/resolvers/category.js';
import {Category as category_class} from './src/Allocation/Category/category2.js';
import Query from './src/resolvers/query.js';

const server = new ApolloServer({
    typeDefs,
    resolvers: {
        Category,
        Query,
    },
    context: async(req, res) => ({
        category_class
    }),
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 5000 },
});

console.log(`🚀  Server ready at: ${url}`);

