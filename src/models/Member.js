import mongoose from "mongoose";
import { JustificativeModel, SessionModel } from "./";

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

MemberSchema.pre("remove", function (next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  JustificativeModel.remove({ memberId: this._id }).exec();
  SessionModel.remove({ memberId: this._id }).exec();
  next();
});

const MemberModel = mongoose.model("members", MemberSchema);

export default MemberModel;
