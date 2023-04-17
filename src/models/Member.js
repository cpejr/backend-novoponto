import mongoose, { mongo } from "mongoose";
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
    tribeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tribes",
      required: false,
      default: null,
    },
    badgeId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "badges",
      required: false,
      default: null,
    }],
    imageLink: String,
    responsibleId: { type: mongoose.Schema.Types.ObjectId, ref: "members" },
    message: { text: String, read: Boolean },
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

// Popular automagicamente o campo responsible
MemberSchema.virtual("responsible", {
  ref: "members", // The model to use
  localField: "responsibleId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true,
});

// Popular automagicamente o campo tribe
MemberSchema.virtual("tribe", {
  ref: "tribes", // The model to use
  localField: "tribeId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true,
});

// Popular automagicamente o campo badge
MemberSchema.virtual("Badge", {
  ref: "badges", // tribesThe model to use
  localField: "badgeId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false,
});

// Quando deletar um membro, deletar suas sessoes e justificativas
MemberSchema.pre("remove", function (next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  AditionalHourModel.remove({ memberId: this._id }).exec();
  SessionModel.remove({ memberId: this._id }).exec();
  next();
});

MemberSchema.statics.getMembersWithAccessArray = async function (accessArray) {
  let query = [
    {
      $lookup: {
        from: "roles",
        localField: "roleId",
        foreignField: "_id",
        as: "role",
      },
    },
    {
      $unwind: {
        path: "$role",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "members",
        localField: "responsibleId",
        foreignField: "_id",
        as: "responsible",
      },
    },
    {
      $unwind: {
        path: "$responsible",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "tribes",
        localField: "tribeId",
        foreignField: "_id",
        as: "tribe",
      },
    },
    {
      $unwind: {
        path: "$tribe",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "badges",
        localField: "badgeId",
        foreignField: "_id",
        as: "Badge",
      },
    },
    {
      $sort: {
        name: 1,
      },
    },
  ];

  if (accessArray)
    query.push({ $match: { "role.access": { $in: accessArray } } });

  return this.aggregate(query);
};

// Retorna a soma das sessoes com as horas adicionais de todos os membros em um dado intervalo de tempo
MemberSchema.statics.getAllMembersDataForCompilation = async function ({
  startDate,
  endDate,
  compileGroup = 1,
}) {
  const extraExpr1 = {};
  const extraExpr2 = {};
  if (startDate || endDate) {
    extraExpr1.start = {};
    extraExpr2.date = {};

    if (startDate) {
      extraExpr1.start["$gte"] = startDate;
      extraExpr2.date["$gte"] = startDate;
    }
    if (endDate) {
      extraExpr1.start["$lte"] = endDate;
      extraExpr2.date["$lte"] = endDate;
    }
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
              ...extraExpr1,
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
              ...extraExpr2,
            },
          },
        ],
        as: "aditionalhours",
      },
    },
    {
      $project: {
        member: 1,
        aditionalhours: 1,
        sessions: 1,
        sessionsBiggerThan0: {
          $filter: {
            input: "$sessions",
            as: "session",
            cond: { $gt: ["$$session.duration", 0] },
          },
        },
        totalSessions: { $sum: "$sessions.duration" },
        totalAditional: { $sum: "$aditionalhours.amount" },
      },
    },
    {
      $project: {
        member: 1,
        aditionalhours: 1,
        sessions: 1,
        sessionsBiggerThan0: 1,
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
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "tribes",
        localField: "member.tribeId",
        foreignField: "_id",
        as: "member.tribe",
      },
    },
    {
      $unwind: {
        path: "$member.tribe",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "badges",
        localField: "member.badgeId",
        foreignField: "_id",
        as: "member.Badge",
      },
    },
    {
      $unwind: {
        path: "$member.Badge",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: { "member.role.compileGroup": compileGroup },
    },
  ]);
};

const MemberModel = mongoose.model("members", MemberSchema);

export default MemberModel;
