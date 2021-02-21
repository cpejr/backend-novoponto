import SessionModel from "../../../models/Session";
import MemberModel from "../../../models/Member";
import { mili2time } from "../../../utils/dateFunctions";
import { SESSION_CREATED } from "./channels";
import { UserInputError } from "apollo-server";

export default {
  Session: {
    member: ({ memberId }) => MemberModel.findById(memberId),

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
  },

  Query: {
    sessions: (_, { memberId }) => SessionModel.find({ memberId }),
    
    loggedMembers: async () => {
      const response = await SessionModel.find({
        end: null,
      }).populate("member");

      return response.map((session) => session.toJSON({ virtuals: true }));
    },
  },

  Mutation: {
    startSession: async (_, { memberId }) => {
      const islogged = await SessionModel.findOne({
        memberId,
        end: null,
      }).populate("member");

      if (!islogged)
        return await SessionModel.create({ memberId, start: Date.now() });
      else
        throw new UserInputError(`${islogged.name} já está logado/a`, {
          session: islogged.toJSON({ virtuals: true }),
        });
    },

    endSession: async (_, { memberId }) => {
      const islogged = await SessionModel.findOne({
        memberId,
        end: null,
      }).populate("member");

      if (islogged)
        return await SessionModel.findByIdAndUpdate(islogged._id, {
          end: Date.now(),
        });
      else
        throw new UserInputError(`${islogged.name} você não está logado/a`, {
          session: islogged.toJSON({ virtuals: true }),
        });
    },
  },

  Subscription: {
    sessionCreated: {
      subscribe: (obj, args, { pubsub }) =>
        pubsub.asyncIterator("SESSION_CREATED"),
    },
  },
};
