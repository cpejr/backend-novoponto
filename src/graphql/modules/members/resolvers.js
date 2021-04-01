import { MemberModel } from "../../../models";

export default {
  Member: {
    responsible: ({ responsible, responsibleId }) => {
      // Se já existir o responsável, não faça a requisição novamente.
      if (responsible) return responsible;
      if (responsibleId) return MemberModel.findById(responsibleId);
      return;
    },
  },

  Query: {
    members: () => MemberModel.find(),
    membersByResponsible: (_, { responsibleId }) =>
      MemberModel.find({ responsibleId }),
    member: (_, { _id }) => MemberModel.findById(_id),
  },

  Mutation: {
    createMember: (_, { data }) => MemberModel.create(data),

    addMandatory: (_, { memberId, data }) =>
      MemberModel.findByIdAndUpdate(
        memberId,
        { $push: { mandatories: data } },
        { new: true }
      ),
    removeMandatory: (_, { memberId, mandatoryId }) =>
      MemberModel.findOneAndUpdate(
        {
          _id: memberId,
        },
        {
          $pull: { mandatories: { $elemMatch: { _id: mandatoryId } } },
        }
      ),

    updateMember: (_, { memberId, data }) =>
      MemberModel.findOneAndUpdate(id, data, { new: true }),
  },
};
