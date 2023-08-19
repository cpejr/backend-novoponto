import _ from "lodash";
import jwt from "jsonwebtoken";

import { NoteModel, StudentModel } from "../../../models";

export default {
  Note: {

  },

  Query: {
    Notes: (_, { studentId, noteId, text }) => NoteModel.findById(  )

    },

  Mutation: {

  }
};