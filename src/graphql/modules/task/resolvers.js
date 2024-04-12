import { TaskModel } from "../../../models";

export default {
  Query: {
    tasks: () => TaskModel.find({ active: true }),
  },

  Mutation: {
    createTask: async (_, { data }) => {
      return TaskModel.create(data);
    },
    deleteTask: async (_, { taskId }) =>
      TaskModel.findByIdAndUpdate(
        { _id: taskId },
        { active: false },
        { new: true }
      ),
    updateTask: (_, { taskId, data }) =>
      TaskModel.findOneAndUpdate({ _id: taskId }, data, { new: true }),
  },
};
