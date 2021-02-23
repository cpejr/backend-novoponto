import { RoleModel } from "../../../models";

export default {
  Query: {
    Roles: () => RoleModel.find(),
  },

  Mutation: {
    createRole: async (_, { data }) => RoleModel.create(data),
    deleteRole: async (_, { roleId }) => RoleModel.findByIdAndDelete(roleId),
  },
};
