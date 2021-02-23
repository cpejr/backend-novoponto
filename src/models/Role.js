import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    access: {
      type: Number,
      required: true,
    },
  },
  { timestamps: false, versionKey: false }
);

const RoleModel = mongoose.model("roles", RoleSchema);

export default RoleModel;
