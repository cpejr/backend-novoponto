import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema (
    {
        // studentId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "students",
        //     required: true,
        // },
        // noteId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "notes",
        //     required: true,
        // },
        name: {
            type: String,
            required: true,
        },
    },
    { timestamps: false, versionKey: false }
);

const StudentModel = mongoose.model("students", StudentSchema);
export default StudentModel;