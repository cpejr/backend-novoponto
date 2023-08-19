import _ from "lodash";
import jwt from "jsonwebtoken";

import { StudentModel, NoteModel } from "../../../models";

export default {
    Query: {
      students: () => StudentModel.find(),
      student: (_, { _id }) => StudentModel.findById(_id), 
    },
  
    Mutation: {
      createStudent: (_, { data }) => StudentModel.create(data),
      deleteStudent: async (_, { _id }) => !!(await StudentModel.findByIdAndDelete(_id)),
      updateStudent: (_, { studentId, data }) => StudentModel.findOneAndUpdate({ _id: studentId }, data, {new: true})
    }
  }