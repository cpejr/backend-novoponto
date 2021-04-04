import Firebase from "./services/Firebase";
import FirebaseStore from "./services/FirebaseStore";
import Mongo from "./services/Mongo";
import auth from "./auth";

import { PubSub, ApolloServer } from "apollo-server";

const pubsub = new PubSub();

let members = [
  {
    _id: "001",
    firstname: "Jhonny",
    lastname: "Prates",
    status: "Tô aqui",
    responsible: "002",
  },
  {
    _id: "002",
    firstname: "Arthur",
    lastname: "Braga",
    status: "Tô aqui não",
    responsible: "001",
  },
];

let sessions = [
  {
    member: "001",
    start: "Agora",
    description: "Dormindo",
    status: "Logado",
  },
];

export default async function startServer({ typeDefs, resolvers }) {
  Firebase.config();
  FirebaseStore.config();
  await Mongo.config();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: { pubsub, auth },
  });

  server
    .listen({ port: process.env.PORT || 4000 })
    .then(({ url }) => console.log(`✅ Server started at ${url}`));
}
