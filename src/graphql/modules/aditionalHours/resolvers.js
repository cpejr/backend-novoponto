import { AditionalHourModel, MemberModel } from "../../../models";

export default {
  AditionalHour: {
    member: async ({ member, memberId }) => {
      if (!member) MemberModel.findById(memberId).populate("role");
      return member;
    },

    duration: ({ end, start }) => {
      return end - start;
    },
  },

  Query: {
    AditionalHours: (_, { memberId }) => AditionalHourModel.find({ memberId }),
  },

  Mutation: {
    deleteAditionalHours: async (_, { aditionalHoursId }) =>
      AditionalHourModel.findByIdAndDelete(aditionalHoursId),
    sendAditionalHours: async (
      _,
      {
        data,
      }
    ) => {
      let aditionalHours = await AditionalHourModel.create(
        data
      );
      let addhours = await AditionalHourModel.findOne(aditionalHours)
        .populate("task")
        .populate("project")
        .exec();
      console.log(addhours);

      //console.log(data);
      return addhours;
    },
  },
};
