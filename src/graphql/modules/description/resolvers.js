import { DescriptionModel } from "../../../models";

export default {
  Query: {
    descriptions: () => DescriptionModel.find(),
    description: (_, { _id }) => DescriptionModel.findById(_id),
  },

  Mutation: {
    createDescription: async (_, { data }) => DescriptionModel.create(data),
    deleteDescription: async (_,{_id})=> DescriptionModel.findByIdAndDelete(_id),
  },
};
