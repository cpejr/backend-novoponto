import mongoose from "mongoose";


const NoteSchema = new mongoose.Schema (
    {
        // noteId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "notes",
        //     required: true,
        // },
        // studentId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "students",
        //     required: true,
        // },
        text: {
            type: String,
            required: true,
        },
    },
    { timestamps: false, versionKey: false }
);

const NoteModel = mongoose.model("notes", NoteSchema);

export default NoteModel;