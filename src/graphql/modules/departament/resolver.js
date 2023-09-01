import { DepartamentModel } from "../../../models";


export default {
  Query: {
    departament: () => DepartamentModel.find().sort("name"),
  },

  Mutation: {
    createDepartament: async (_, { data }) => DepartamentModel.create(data),
    deleteDepartament: async (_, { departament_id }) =>
      DepartamentModel.findByIdAndDelete(departament_id),
    updateDepartament: (_, { departament_id, data }) =>
      DepartamentModel.findOneAndUpdate({ _id: departament_id }, data, { new: true }),
  },
};