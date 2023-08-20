import mongoose from "mongoose";
import NoteModel from "./Note";

const StudentSchema = new mongoose.Schema (
    {
        name: {
            type: String,
            required: true,
        },
    },
    { timestamps: false, versionKey: false }
);

const StudentModel = mongoose.model("students", StudentSchema);
export default StudentModel;