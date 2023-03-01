import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import typeDefs from './graphql_schema';
import Category from './src/resolvers/category';
import {Category as Category_class} from './src/Allocation/Category/category2';

const server = new ApolloServer({
    typeDefs,
    resolvers: {
        Category,
    },
    context: async(req, res) => ({
        category: Category_class,
    }),
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 5000 },
});

console.log(`🚀  Server ready at: ${url}`);

