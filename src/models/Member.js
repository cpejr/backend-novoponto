import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    start: Date,
    finish: Date,
  },
  { timestamps: false, _id: false }
);

const JustificativeSchema = new mongoose.Schema(
  {
    date: Date,
    time: Date,
    description: String,
  },
  { timestamps: true }
);

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
    firebase_id: String,
    name: String,
    status: String,
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: "roles" },
    image_link: String,
    responsible_id: { type: mongoose.Schema.Types.ObjectId, ref: "members" },
    sessions: [SessionSchema],
    justificatives: [JustificativeSchema],
    mandatories: [MandatorySchema],
  },
  { timestamps: true }
);

const MemberModel = mongoose.model("members", MemberSchema);

export default MemberModel;
