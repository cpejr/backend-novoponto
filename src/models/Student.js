import mongoose, { mongo } from "mongoose";

const StudentSchema = new mongoose.Schema (
    {
        // studentId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "students",
        //     required: true,
        // },
        name: {
            type: String,
            required: true,
        }
    }
);

const StudentModel = mongoose.model("students", StudentSchema);

export default StudentModel;