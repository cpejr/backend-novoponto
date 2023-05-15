import mongoose from "mongoose";
import { MemberModel } from ".";

const hexColorRegex = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/;

const TribeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    color: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      validate: {
        validator: (value) => {
          return hexColorRegex.test(value);
        },
        message: (props) =>
          `${props.value} não está no formato de cor hexadecimal.`,
      },
    },
    segment: {
      type: String,
      required: true,
    },
  },
  { timestamps: false, versionKey: false }
);

// Quando deletar uma tribo, ela é deletada dos membros
TribeSchema.pre("remove", function (next) {
  MemberModel.updateMany(
    { tribeId: this._id },
    { $set: { tribeId: null } },
    { multi: true }
  );
  next();
});

const TribeModel = mongoose.model("tribes", TribeSchema);

export default TribeModel;
