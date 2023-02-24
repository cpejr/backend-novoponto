import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    active: {type: Boolean, required: true, default: true},
  },
  { timestamps: false, versionKey: false }
);

const TaskModel = mongoose.model("tasks", TaskSchema);

export default TaskModel;