import mongoose from "mongoose";

const ChangelogSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    changeLogText: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: false, versionKey: false }
);


const ChangelogModel = mongoose.model("changelogs", ChangelogSchema);

export default ChangelogModel;