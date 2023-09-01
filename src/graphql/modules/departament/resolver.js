import { DepartamentModel } from "../../../models";


export default {
  Query: {
    departament: () => DepartamentModel.find().sort("name"),
  },

  Mutation: {
    createDepartament: async (_, { data }) => DepartamentModel.create(data),
    deleteDepartament: async (_, { departamentId }) =>
      DepartamentModel.findByIdAndDelete(departamentId),
    updateDepartament: (_, { departamentId, data }) =>
      DepartamentModel.findOneAndUpdate({ _id: departamentId }, data, { new: true }),
  },
};