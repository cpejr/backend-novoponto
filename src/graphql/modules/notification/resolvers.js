import NotificationModel from "../../../models/Notification";

const resolvers = {
  Query: {
    notifications: async () => {
      return await NotificationModel.find();
    },
  },
  Mutation: {
    createNotification: async (_, { text, link }) => {
      const notification = new NotificationModel({ text, link });
      await notification.save();
      return notification;
    },
    deleteNotification: async (_, { _id }) =>
      NotificationModel.findByIdAndDelete({ _id }),
  },
};

export default resolvers;
