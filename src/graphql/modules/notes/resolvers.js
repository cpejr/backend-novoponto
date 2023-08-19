import _ from "lodash";
import jwt from "jsonwebtoken";

import { NoteModel, StudentModel } from "../../../models";

export default {
  Note: {
    student: ({ student, studentId }) => {
      if(student) return student;
      else return StudentModel.findById(studentId);
    },
  },

  Query: {
    Notes: (_, { studentId, noteId, text }) => NoteModel.find( {studentId}, {noteId}, {text} ),
  },

  Mutation: {
    sendNote: async (_, { data }) => NoteModel.create(data),
    deleteNote: async (_, { _id }) => NoteModel.findByIdAndDelete(_id),
    updateNote: (_, { noteId, data }) => NoteModel.findOneAndUpdate({ _id: noteId }, data, {new: true}),
  },
};