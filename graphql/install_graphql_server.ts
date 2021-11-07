import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import resolvers from './resolvers';
import typeDefs from './schema.graphql';

export default async function installGraphqlServer(app: any) {
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground()
        ]
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
}
