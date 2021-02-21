import MemberModel from "../../../models/Member";

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
    membersByResponsible: ({ responsibleId }) =>
      MemberModel.find({ responsibleId }),
    member: (_, { _id }) => MemberModel.findById(_id),
  },
  Mutation: {
    createMember: (_, { data }) => MemberModel.create(data),
    //updateMember: (_, { id, data }) => MemberModel.findOneAndUpdate(id, data, {new: true})
  },
};
