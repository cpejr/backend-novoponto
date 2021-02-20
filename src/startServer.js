import Firebase from "./services/Firebase";
import FirebaseStore from "./services/FirebaseStore";

import { ApolloServer, PubSub } from "apollo-server";

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

export default function startServer({ typeDefs, resolvers }) {
  Firebase.config();
  FirebaseStore.config();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: { pubsub, members, sessions },
  });
  server
    .listen()
    .then(({ url }) => console.log(`🔥 Server started at ${url} 🔥`));
}
