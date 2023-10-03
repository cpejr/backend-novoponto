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
    setAditionalHours: async (
      _,
      {
        memberId,
        isPresential,
        start,
        end,
        date,
        taskId,
        projectId,
        description,
      }
    ) => {
      let aditionalHours = await AditionalHourModel.create({
        memberId,
        isPresential,
        taskId,
        projectId,
        description,
        start,
        end,
        date,
      });
      let addhours = await AditionalHourModel.findOne(aditionalHours)
        .populate("task")
        .populate("project")
        .exec();
      console.log(addhours);

      return addhours;
    },
  },
};
