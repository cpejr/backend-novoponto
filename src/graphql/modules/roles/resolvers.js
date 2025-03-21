import { RoleModel } from "../../../models";

export default {
  Query: {
    roles: () => RoleModel.find().sort("name").populate("departament"),
  },

  Mutation: {
    createRole: async (_, { data }) => RoleModel.create(data),
    deleteRole: async (_, { roleId }) => RoleModel.findByIdAndDelete(roleId),
    updateRole: (_, { roleId, data }) =>
      RoleModel.findOneAndUpdate({ _id: roleId }, data, { new: true }),
  },
};
