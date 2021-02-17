import startServer from "./startServer";
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";

//  Toda request é POST
//  Toda request bate no MESMO endpoint (/graphql)

//  Query => Obter informações (GET)
//  Mutation => Manipular dados(POST/Put/PATCH/DELETE)
//  Scalar types => String, Int, Boolean, Float e ID

startServer({ typeDefs, resolvers });
