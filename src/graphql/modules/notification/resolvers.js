import NotificationModel from "../../../models/Notification";
import { usersList } from "../../../utils/usersList";
const resolvers = {
  Query: {
    notifications: async () => {
      return await NotificationModel.find();
    },
  },
  Mutation: {
    createNotification: async (_, { text, link, linkValidation }) => {
      const notification = new NotificationModel({
        text,
        link,
        linkValidation,
      });
      await notification.save();
      return notification;
    },
    deleteNotification: async (_, { _id }) =>
      NotificationModel.findByIdAndDelete({ _id }),
    getUserList: async (_, sheetID) => {
      const isValid = await usersList(sheetID);
      console.log("respota: ", isValid);
      return isValid;
    },
  },
};

export default resolvers;
