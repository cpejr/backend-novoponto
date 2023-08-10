import { ProjectsModel } from "../../../models";

export default {
  Query: {
    projects: () => ProjectsModel.find().sort("name"),
    project: (_, { _id }) => ProjectsModel.findById(_id),
  },

  Mutation: {
    createProject: async (_, { data }) => ProjectsModel.create(data),
  },
};
