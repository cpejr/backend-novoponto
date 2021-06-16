import { AuthenticationError, UserInputError } from "apollo-server-errors";
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

    description: ({ memberId, description }, _, { auth }) => {
      if (auth?.member?.role?.access > 0 || auth?.member?._id == memberId)
        return description || "";

      return;
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

    deleteAditionalHour: async (_, { _id }, { auth }) => {
      let result;

      if (auth?.member?.role?.access > 0)
        result = await AditionalHourModel.findByIdAndDelete(_id);
      else if (auth?.member?._id)
        result = await AditionalHourModel.findOneAndDelete({
          _id,
          memberId: auth?.member?._id,
        });
      else throw new AuthenticationError("O usário não está autenticado");

      if (!result || result === null)
        throw new UserInputError("Horário adicional não encontrado");

      return !!result;
    },
  },
};
