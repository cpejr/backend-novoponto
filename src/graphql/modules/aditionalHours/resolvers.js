import { MemberModel, AditionalHourModel } from "../../../models";
import { mili2time } from "../../../utils/dateFunctions";

export default {
  AditionalHour: {
    member: ({ member, memberId }) => {
      if (member) return member;
      else return MemberModel.findById(memberId);
    },

    formatedAmount: ({ amount: duration, end, start }) => {
      let dur = Math.abs(duration);

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
    aditionalHours: (_, { memberId, startDate, endDate }) =>
      AditionalHourModel.findByDateRangeWithDuration(
        { memberId },
        { startDate, endDate }
      ),
  },

  Mutation: {
    sendAditionalHour: async (_, { data }) => AditionalHourModel.create(data),

    deleteAditionalHour: async (_, { _id }) =>
      AditionalHourModel.findByIdAndDelete(_id),
  },
};
