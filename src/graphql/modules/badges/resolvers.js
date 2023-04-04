import { BadgesModel } from "../../../models";
import { uploadFile, deleteFolder } from "../../../services/FirebaseStore";

export default {
  Query: {
    badges: () => BadgesModel.find().sort("name"),
    badge: (_, { _id }) => BadgesModel.findById(_id),
  },

  Mutation: {
    createBadge: async (_, { data }) => {
      const { image, ...formatedData } = data;
      const file = await image;

      const folderName = `badges/${formatedData.name}`;

      formatedData.url = await uploadFile(file, folderName);

      return BadgesModel.create(formatedData);
    },
    deleteBadge: async (_, { badgeId }) =>
      BadgesModel.findByIdAndDelete(badgeId),
    updateBadge: async (_, { badgeId, data }) =>
      BadgesModel.findOneAndUpdate({ _id: badgeId }, data, { new: true }),
  },
};
