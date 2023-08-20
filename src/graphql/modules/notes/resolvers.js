import _ from "lodash";
import jwt from "jsonwebtoken";

import { NoteModel } from "../../../models";

export default {
  Query: {
    notes: () => NoteModel.find(),
    note: (_, { _id }) => NoteModel.findById(_id),
  },

  Mutation: {
    createNote: (_, { data }) => NoteModel.create(data),
    deleteNote: async (_, { noteId }) => !!(await NoteModel.findByIdAndDelete(noteId)),
    updateNote: (_, { noteId, data }) => NoteModel.findOneAndUpdate({ _id: noteId }, data, {new: true}),
  },
};
