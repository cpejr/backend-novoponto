import { SESSION_CREATED } from "./channels";

export default {
  Session: {
    member: (sess, _, { members }) =>
      members.find((member) => member._id === sess.member),
  },
  
  Query: {
    sessions: (_, { member }, { sessions }) => {
      return sessions.filter((session) => session.member === member);
    },
  },

  Mutation: {
    createSession: (_, { data }, { pubsub, sessions }) => {
      const newSession = {
        _id: String(Math.random()),
        member: data.member,
        start: data.start,
        description: data.description,
        status: "Logado",
      };

      sessions.push(newSession);
      pubsub.publish(SESSION_CREATED, {
        sessionCreated: newSession,
      });
      return newSession;
    },
  },

  Subscription: {
    sessionCreated: {
      subscribe: (obj, args, { pubsub }) =>
        pubsub.asyncIterator("SESSION_CREATED"),
    },
  },
};
