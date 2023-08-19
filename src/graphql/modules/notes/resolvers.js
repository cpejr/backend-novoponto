import _ from "lodash";
import jwt from "jsonwebtoken";

import { NoteModel, StudentModel } from "../../../models";

export default {
  Query: {
    note: (_, { _id }) => NoteModel.findById(_id),
  },

  Mutation: {
    createNote: (_, { data }) => NoteModel.create(data),
    deleteNote: async (_, { _id }) => !!(await NoteModel.findByIdAndDelete(_id)),
    updateNote: (_, { noteId, data }) => NoteModel.findOneAndUpdate({ _id: noteId }, data, {new: true}),
  },
};