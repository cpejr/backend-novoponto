import { UserInputError } from "apollo-server";

import { SessionModel, MemberModel } from "../../../models";
import { mili2time } from "../../../utils/dateFunctions";
import { SESSION_UPDATE } from "./channels";

export default {
  Session: {
    member: async ({ member, memberId }) => {
      if (!member) MemberModel.findById(memberId).populate("role");
      return member;
    },

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

  Query: {
    sessions: (_, { memberId, startDate, endDate }) =>
      SessionModel.findByDateRangeWithDuration(
        { memberId },
        { startDate, endDate }
      ),

    loggedMembers: () => SessionModel.getLoggedMembers(),
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
};
