import { TaskModel } from "../../../models";

export default {
  Query: {
    tasks: () => TaskModel.find({ active: true }),
  },

  Mutation: {
    createTask: async (_, { data }) => {
      const newTask = await TaskModel.findOneAndUpdate(
        { name: data.name, active: false },
        { active: true },
        { new: true }
      );
      console.log(newTask);
      if (!newTask) {
        console.log("if");
        await TaskModel.create(data);
      }
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
