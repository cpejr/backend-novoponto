import { uniqueId } from "lodash";
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    id: {type: mongoose.Schema.Types.ObjectId, required: true, unique: true},
    name: { type: String, required: true, unique: true },
    active: {type: Boolean, required: true, default: true},
  },
  { timestamps: false, versionKey: false }
);



const TaskModel = mongoose.model("tasks", TaskSchema);

export default TaskModel;