import { ColorModel } from "../../../models";

export default {
  Query: {
    colors: () => ColorModel.find().sort("color"),
    color: (_, { _id }) => ColorModel.findById(_id),
  },

  Mutation: {
    createColor: async (_, { data }) => ColorModel.create(data),
    deleteColor: async (_, { colorId }) =>ColorModel.findByIdAndDelete(colorId),
  },
};
