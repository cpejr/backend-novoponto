import { ProjectsModel } from "../../../models";

export default {
  Query: {
    projects: () => ProjectsModel.find().sort("name"),
    project: (_, { _id }) => ProjectsModel.findById(_id),
  },

  Mutation: {
    createProject: async (_, { data }) => ProjectsModel.create(data),
    deleteProject: async (_, { _id }) => ProjectsModel.findByIdAndDelete(_id),
    updateProject: async (_, { _id, data }) => 
      ProjectsModel.findOneAndUpdate( { _id: _id }, data, { new: true }),
  },
};
