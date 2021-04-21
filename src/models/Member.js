import mongoose from "mongoose";
import { AditionalHourModel, SessionModel } from "./";

const MandatorySchema = new mongoose.Schema(
  {
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    weekDay: { type: Number, required: true },
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
  { timestamps: true, versionKey: false }
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

// Popular automagicamente o campo role
MemberSchema.virtual("responsible", {
  ref: "members", // The model to use
  localField: "responsibleId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true,
});

// Quando deletar um membro, deletar suas sessoes e justificativas
MemberSchema.pre("remove", function (next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  AditionalHourModel.remove({ memberId: this._id }).exec();
  SessionModel.remove({ memberId: this._id }).exec();
  next();
});

// Retorna a soma das sessoes com as horas adicionais de todos os membros em um dado intervalo de tempo
MemberSchema.statics.getAllMembersDataForCompilation = async function ({
  startDate,
  endDate,
  compileGroup = 1
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
      $lookup: {
        from: "aditionalhours",
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
        ],
        as: "aditionalhours",
      },
    },
    {
      $project: {
        member: 1,
        totalSessions: { $sum: "$sessions.duration" },
        totalAditional: { $sum: "$aditionalhours.amount" },
      },
    },
    {
      $project: {
        member: 1,
        total: { $add: ["$totalSessions", "$totalAditional"] },
      },
    },
    {
      $lookup: {
        from: "roles",
        localField: "member.roleId",
        foreignField: "_id",
        as: "member.role",
      },
    },
    {
      $unwind: {
        path: "$member.role",
      },
    },
    {
      $match: {"member.role.compileGroup": compileGroup}
    }
  ]);
};

const MemberModel = mongoose.model("members", MemberSchema);

export default MemberModel;
