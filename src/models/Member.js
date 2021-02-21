import mongoose from "mongoose";

const MandatorySchema = new mongoose.Schema(
  {
    startTime: Date,
    endTime: Date,
    weekday: String,
  },
  { timestamps: false }
);

const MemberSchema = new mongoose.Schema(
  {
    firebaseId: String,
    name: String,
    status: String,
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "roles" },
    imageLink: String,
    responsibleId: { type: mongoose.Schema.Types.ObjectId, ref: "members" },
    message: String,
    mandatories: [MandatorySchema],
  },
  { timestamps: true }
);

const MemberModel = mongoose.model("members", MemberSchema);

export default MemberModel;
