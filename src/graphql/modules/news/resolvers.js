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
        newsId: { $nin: data.map(({ newsId }) => newsId) },
      });

      removedNews.forEach(({ newsId }) => {
        deleteFolder(`Public/${newsId}/`);
      });

      const result = await NewsModel.deleteMany({});
      return await NewsModel.insertMany(data);
    },
    uploadImage: async (_, { file, newsId }) => {
      const image = await file;
      console.log(image);
      console.log(newsId);
      return uploadFile(image, newsId);
    },
  },
};
