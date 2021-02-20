import MemberModel from "../../../models/Member";

export default {
  Member: {
    responsible: (memb, _) => MemberModel.findById(memb.responsible_id),
  },
  Query: {
    members: () => MemberModel.find(),
    membersByResponsible: ({ responsible_id }) =>
      MemberModel.find({ responsible_id }),
    member: (_, { _id }) => {
      MemberModel.findById(_id);
    },
  },
  Mutation: {
    createMember: (_, { data }) => MemberModel.create(data),
    //updateMember: (_, { id, data }) => MemberModel.findOneAndUpdate(id, data, {new: true})
  },
};
