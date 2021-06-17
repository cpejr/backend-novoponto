import { NewsModel } from "../../../models";

export default {
  Query: {
    news: (_,params) => NewsModel.find(),
  },

  Mutation: {
    createNews: (_,data) => NewsModel.create(data),
    deleteNews: (_, newsId) => NewsModel.findByIdAnddelete(newsId)
  }
};
