import { UserInputError } from "apollo-server";
import { GraphQLScalarType, Kind } from "graphql";
import mongoose from "mongoose";

import SessionModel from "../../../models/Session";
import MemberModel from "../../../models/Member";
import { mili2time } from "../../../utils/dateFunctions";
import { SESSION_UPDATE } from "./channels";

export default {
  Session: {
    member: async ({ memberId }) => MemberModel.findById(memberId),

    duration: ({ duration, end, start }) => {
      if (duration) return duration;
      if (end) return end - start;
      return Date.now() - start;
    },

    formatedDuration: ({ duration, end, start }) => {
      let dur = duration;

      if (!dur) {
        if (end) dur = end - start;
        else dur = Date.now() - start;
      }

      return mili2time(dur);
    },

    // action: ({ end }) => {
    //   if (end !== null) return "FINISHED";
    //   else return "STARTED";
    // },
  },

  CompiledSessions: {
    formatedTotal: ({ total }) => {
      let dur = total;

      if (!dur) dur = 0;

      return mili2time(dur);
    },
  },

  Query: {
    sessions: async (_, { memberId, startDate, endDate }) => {
      const match = { memberId: mongoose.Types.ObjectId(memberId) };

      if (startDate || endDate) {
        const start = {};
        if (startDate) start["$gte"] = startDate;
        if (endDate) start["$lte"] = endDate;

        match.start = start;
      }

      const aggregate = [
        {
          $match: match,
        },
        {
          $addFields: {
            duration: { $subtract: ["$end", "$start"] },
          },
        },
      ];

      const sessions = await SessionModel.aggregate(aggregate);
      let total = 0;
      sessions.forEach((session) => (total += session.duration));
      return { sessions, total };
    },

    loggedMembers: async () => {
      const response = await SessionModel.find({
        end: null,
      }).populate("member");

      return response.map((session) => session.toJSON({ virtuals: true }));
    },
  },

  Mutation: {
    startSession: async (_, { memberId }, { pubsub }) => {
      const islogged = await SessionModel.findOne({
        memberId,
        end: null,
      }).populate("member");

      if (!islogged) {
        let newSession = await SessionModel.create({
          memberId,
          start: Date.now(),
        });
        newSession = newSession.toJSON({ virtuals: true });

        pubsub.publish(SESSION_UPDATE, {
          sessionUpdate: {
            session: newSession,
            action: "STARTED",
          },
        });

        return newSession;
      } else
        throw new UserInputError(`${islogged.member.name} já está logado/a`, {
          session: islogged.toJSON({ virtuals: true }),
        });
    },

    endSession: async (_, { memberId }, { pubsub }) => {
      const islogged = await SessionModel.findOne({
        memberId,
        end: null,
      }).populate("member");

      if (islogged) {
        const session = await SessionModel.findByIdAndUpdate(islogged._id, {
          end: Date.now(),
        });

        pubsub.publish(SESSION_UPDATE, {
          sessionUpdate: {
            session,
            action: "FINISHED",
          },
        });

        return session;
      } else throw new UserInputError(`Você não está logado/a`);
    },
  },

  Subscription: {
    sessionUpdate: {
      subscribe: (obj, args, { pubsub }) =>
        pubsub.asyncIterator(SESSION_UPDATE),
    },
  },

  DateScalar: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    /*
     * Serialize method converts the scalar's back-end representation to a
     * JSON-compatible format so Apollo Server can include it in
     * an operation response.
     */
    serialize(value) {
      return value.toISOString(); // Convert outgoing Date to integer for JSON
    },
    /**
     * ParseValue Converts the scalar's serialized JSON value to its back-end
     * representation
     */
    parseValue(value) {
      return new Date(value); // Convert incoming value to Date
    },

    /**
     * ParseLiteral method to convert the value's AST representation
     * (which is always a string) to the JSON-compatible format expected
     * by the parseValue method (the example above expects an integer).
     */
    parseLiteral(ast) {
      if (ast.kind === Kind.INT || ast.kind === Kind.STRING)
        return new Date(ast.value);

      return null; // Invalid hard-coded value (not an integer nor an String)
    },
  }),
};
