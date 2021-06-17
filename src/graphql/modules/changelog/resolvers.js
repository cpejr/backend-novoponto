import { ChangelogModel } from "../../../models";

export default {
  Query: {
    lastChangeLog: async () => {
      const result = await ChangelogModel.find().sort({ version: -1 }).limit(1);
      return result[0];
    },
  },

  Mutation: {
    createChangelog: async (_, { data }) =>
      ChangelogModel.create({ ...data, date: Date.now() }),
  },
};
