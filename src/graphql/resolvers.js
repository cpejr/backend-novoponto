import { fileLoader, mergeResolvers } from "merge-graphql-schemas";
import path from "path";

const resolversArray = fileLoader(
  path.join(__dirname, "modules", "**", "*resolvers.js")
);
const resolvers = mergeResolvers(resolversArray);

//console.log("🚀 ~ file: typeDefs.js ~ line 6 ~ typeDefs", typeDefs)

export default resolvers;
