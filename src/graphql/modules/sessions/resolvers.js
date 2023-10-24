import { UserInputError } from "apollo-server";

import { SessionModel, MemberModel, TaskModel } from "../../../models";
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
  },

  Query: {
    sessions: (_, { memberId, startDate, endDate, isPresential, taskId }) =>
      SessionModel.findByDateRangeWithDuration(
        { memberId },
        { startDate, endDate },
        { isPresential },
        { taskId }
      ),

    loggedMembers: () => SessionModel.getLoggedMembers(),
  },

  Mutation: {
    addSession: async (_, { memberId, isPresential, taskId, projectId, description, start, end }) => {
      const newSession = await SessionModel.create({
        memberId,
        isPresential,
        taskId,
        projectId,
        description,
        start,
        end,
      });

      return newSession;
    },
    deleteSession: async (_, { sessionId }) => SessionModel.findByIdAndDelete(sessionId),
    updateSession: (_, { sessionId, data }) =>
      SessionModel.findOneAndUpdate({ _id: sessionId }, data, { new: true }),
    startSession: async (
      _,
      { memberId, isPresential, taskId, projectId, description },
      { pubsub }
    ) => {
      const islogged = await SessionModel.findOne({
        memberId,
        end: null,
      }).populate(["member", "task", "project"]);
      if (!islogged) {
        let newSession = await SessionModel.create({
          memberId,
          isPresential,
          taskId,
          projectId,
          description,
          start: Date.now(),
        });

        newSession = newSession.toJSON({ virtuals: true });

        pubsub.publish(SESSION_UPDATE, {
          sessionUpdate: {
            session: newSession,
            action: "STARTED",
          },
        });
        newSession.member = MemberModel.findOne({ _id: memberId });
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

    endAllSessions: async (_, __, { pubsub }) => {
      const sessions = await SessionModel.updateMany(
        {
          end: null,
        },
        {
          end: Date.now(),
        }
      ).populate("member");

      pubsub.publish(SESSION_UPDATE, {
        sessionUpdate: {
          action: "END_ALL_SESSIONS",
        },
      });

      return sessions.n;
    },
    endSessionAfter20Hours: async (_, __, { pubsub }) => {
      const twentyHoursInMillis = 20 * 60 * 60 * 1000; 
    
      const sessions = await SessionModel.find({
        end: null,
      }).populate("member");
    
      const sessionsToUpdate = sessions.filter((session) => {
        const currentDuration = Date.now() - session.start;
        return currentDuration >= twentyHoursInMillis;
      });
    
      const updatedSessions = [];
    
      for (const session of sessionsToUpdate) {
        if (session._id) {
          const updatedSession = await SessionModel.findByIdAndUpdate(
            session._id,
            {
              end: Date.now(),
            },
            { new: true }
          );
    
          if (updatedSession) {
            updatedSessions.push(updatedSession);
    
            pubsub.publish(SESSION_UPDATE, {
              sessionUpdate: {
                session: updatedSession,
                action: "FINISHED",
              },
            });
          }
        }
      }
    
      return true;
    },
    
    
  },

  Subscription: {
    sessionUpdate: {
      subscribe: (obj, args, { pubsub }) =>
        pubsub.asyncIterator(SESSION_UPDATE),
    },
  },
};
