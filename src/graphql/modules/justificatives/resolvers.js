import { MemberModel, JustificativeModel } from "../../../models";
import { mili2time } from "../../../utils/dateFunctions";

export default {
  Justificative: {
    member: ({ member, memberId }) => {
      if (member) return member;
      else return MemberModel.findById(memberId);
    },

    event: ({ event, eventId }) => {
      if (event) return event;
      else return EventModel.findById(eventId);
    },

    formatedAmount: ({ duration, end, start }) => {
      let dur = duration;

      if (!dur) {
        if (end) dur = end - start;
        else dur = Date.now() - start;
      }

      return mili2time(dur);
    },
  },

  Query: {
    justificatives: (_, { memberId, startDate, endDate }) =>
      JustificativeModel.findByDateRangeWithDuration(
        { memberId },
        { startDate, endDate }
      ),

    justificativesByEvent: (_, { eventId }) => {
      JustificativeModel.findByEventId( eventId );
    },
  },

  Mutation: {
    sendJustificative: async (_, { data }) => JustificativeModel.create(data),

    deleteJustificative: async (_, { _id }) =>
      JustificativeModel.findByIdAndDelete(_id),
  },
};
