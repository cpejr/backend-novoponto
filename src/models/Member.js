import mongoose from "mongoose";
import { JustificativeModel, SessionModel } from "./";

const MandatorySchema = new mongoose.Schema(
  {
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    weekday: { type: Number, required: true },
  },
  { timestamps: false, versionKey: false }
);

const MemberSchema = new mongoose.Schema(
  {
    firebaseId: String,
    name: { type: String, required: true, unique: true },
    status: String,
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "roles" },
    imageLink: String,
    responsibleId: { type: mongoose.Schema.Types.ObjectId, ref: "members" },
    message: String,
    mandatories: [MandatorySchema],
  },
  { timestamps: true }
);

// Popular automagicamente o campo role
MemberSchema.virtual("role", {
  ref: "roles", // The model to use
  localField: "roleId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true,
});

// Quando deletar um membro, deletar suas sessoes e justificativas
MemberSchema.pre("remove", function (next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  JustificativeModel.remove({ memberId: this._id }).exec();
  SessionModel.remove({ memberId: this._id }).exec();
  next();
});

// Retorna a soma das sessoes de todos os membros em um dado intervalo de tempo
MemberSchema.statics.getAllSessionsByDateRange = async function ({
  startDate,
  endDate,
}) {
  const extraExpr = {};
  if (startDate || endDate) {
    extraExpr.start = {};
    if (startDate) extraExpr.start["$gte"] = startDate;
    if (endDate) extraExpr.start["$lte"] = endDate;
  }

  return this.aggregate([
    {
      $replaceRoot: {
        newRoot: { member: "$$ROOT" },
      },
    },
    {
      $lookup: {
        from: "sessions",
        let: { memberId: "$member._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$memberId", "$$memberId"],
              },
              ...extraExpr,
            },
          },
          {
            $addFields: {
              duration: { $subtract: ["$end", "$start"] },
            },
          },
        ],
        as: "sessions",
      },
    },
    {
      $project: {
        member: 1,
        total: { $sum: "$sessions.duration" },
      },
    },
  ]);
};

const MemberModel = mongoose.model("members", MemberSchema);

export default MemberModel;
