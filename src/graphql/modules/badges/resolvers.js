import { BadgesModel } from "../../../models";

export default {
    Query: {
        badges: () =>BadgesModel.find().sort("name"),
        badge: (_,{_id}) => BadgesModel.findById(_id),
    },

    Mutation: {
        createBadge: async (_, { data }) => BadgesModel.create(data),
        deleteBadge: async (_, { badgeId }) => BadgesModel.findByIdAndDelete(badgeId),
        updateBadge: async (_, { badgeId, data }) => BadgesModel.findOneAndUpdate({ _id: badgeId }, data, {new: true}),
    },
};