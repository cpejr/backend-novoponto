import { BadgesModel } from "../../../models";
import { uploadBadge, deleteBadge } from "../../../services/FirebaseStore";

export default {
  Query: {
    badges: () => BadgesModel.find().sort("name"),
    badge: (_, { _id }) => BadgesModel.findById(_id),
  },

  Mutation: {
    createBadge: async (_, { data }) => {
      const { image, ...formatedData } = data;
      const file = await image;
      formatedData.fileName = `${Date.now()}${formatedData.name}`;
      const folderName = `badges/${formatedData.fileName}`;

      formatedData.url = await uploadBadge(file, folderName);

      return BadgesModel.create(formatedData);
    },
    deleteBadge: async (_, { badgeId }) => {
      const removedBadge = await BadgesModel.findById(badgeId);
      const result = await deleteBadge(removedBadge.fileName);
      return BadgesModel.findByIdAndDelete(badgeId);
    },
    
    updateBadge: async (_, { badgeId, data }) =>{
      const { image, ...formatedData} = data;
      if(image) {
        const file = await image;
        const removedBadge = await BadgesModel.findById(badgeId);
        const result = await deleteBadge(removedBadge.fileName);
        formatedData.fileName = `${Date.now()}${formatedData.name}`;
        const folderName = `badges/${formatedData.fileName}`;
        formatedData.url = await uploadBadge(file, folderName);
      }
      return BadgesModel.findOneAndUpdate({ _id: badgeId },formatedData, { new: true });
    }
      
  },
};
