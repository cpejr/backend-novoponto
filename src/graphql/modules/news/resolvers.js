import { NewsModel } from "../../../models";
import { uploadFile, deleteFolder } from "../../../services/FirebaseStore";

export default {
  Query: {
    news: (_, params) => NewsModel.find(),
  },

  Mutation: {
    createNews: (_, { data }) => NewsModel.create(data),
    deleteNews: (_, { newsId }) => NewsModel.findByIdAnddelete(newsId),
    replaceNews: async (_, { data }) => {
      const removedNews = await NewsModel.find({
        numberId: { $nin: data.map(({ numberId }) => numberId) },
      });

      removedNews.forEach(({ numberId }) => {
        deleteFolder(`Public/${numberId}/`);
      });

      const result = await NewsModel.deleteMany({});
      return await NewsModel.insertMany(data);
    },
    uploadImage: async (_, { file, numberId }) => {
      const image = await file;
      return uploadFile(image, numberId);
    },
  },
};
