import { TribeModel } from "../../../models";

export default {
  Query: {
    tribes: () => TribeModel.find().sort("name"),
  },

  Mutation: {
    createTribe: async (_, { data }) => TribeModel.create(data),
    deleteTribe: async (_, { tribeId }) =>
      TribeModel.findByIdAndDelete(tribeId),
    updateTribe: (_, { tribeId, data }) =>
      TribeModel.findOneAndUpdate({ _id: tribeId }, data, { new: true }),
  },
};
