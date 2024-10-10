import Firebase from "./services/Firebase";
import FirebaseStore from "./services/FirebaseStore";
import Mongo from "./services/Mongo";
import auth from "./auth";
import { startCronWork } from "./utils/Libraries/CRON/CronFunction";

import { PubSub, ApolloServer } from "apollo-server";

const pubsub = new PubSub();

export default async function startServer({ typeDefs, resolvers }) {
  Firebase.config();
  FirebaseStore.config();
  await Mongo.config();
  startCronWork();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      pubsub,
      auth: auth(req),
    }),
    subscriptions: {
      path: "/subscriptions",
    },
  });

  server
    .listen({ port: process.env.PORT || 4000 })
    .then(({ url }) => console.log(`✅ Server started at ${url}`));
}
