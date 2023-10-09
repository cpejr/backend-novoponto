import "dotenv/config";
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import startServer from "./startServer";

//  Toda request é POST
//  Toda request bate no MESMO endpoint (/graphql)

//  Query => Obter informações (GET)
//  Mutation => Manipular dados(POST/PUT/PATCH/DELETE)
//  Scalar types => String, Int, Boolean, Float e ID

// dotenv.config();
startServer({ typeDefs, resolvers });
