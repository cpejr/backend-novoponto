import MemberModel from "../../../models/Member";
import JustificativeModel from "../../../models/Justificative";
import { mili2time } from "../../../utils/dateFunctions";

export default {
  Justificative: {
    member: ({ member, memberId }) => {
      if (member) return member;
      else return MemberModel.findById(memberId);
    },

    formatedAmount: ({ duration, end, start }) => {
      let dur = duration;

      if (!dur) {
        if (end) dur = end - start;
        else dur = Date.now() - start;
      }

      return mili2time(dur);
    },

    action: ({ amount }) => {
      if (amount > 0) return "ADD";
      else return "REMOVE";
    },
  },

  Query: {
    Justificatives: (_, { memberId, startDate, endDate }) =>
      JustificativeModel.findByDateRangeWithDuration(
        { memberId },
        { startDate, endDate }
      ),
  },

  Mutation: {
    sendJustificative: async (_, { data }) => JustificativeModel.create(data),

    deleteJustificative: async (_, { _id }) =>
      JustificativeModel.findByIdAndDelete(_id),
  },
};
