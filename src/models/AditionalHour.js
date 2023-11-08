import mongoose from "mongoose";
import { castToObjectIdFields } from "../utils/modelsFunctions";

const AditionalHourSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "members",
      required: true,
    },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    isPresential: { type: Boolean, required: true},
  },
  { timestamps: false, versionKey: false }
);

AditionalHourSchema.virtual("member", {
  ref: "members", // The model to use
  localField: "memberId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true,
});

AditionalHourSchema.statics.findByDateRangeWithDuration = function (
  match,
  { startDate, endDate },
  { isPresential }
) {
  const newMatch = { ...match };
  
  castToObjectIdFields(newMatch, ["memberId", "_id"])

  if (startDate || endDate) {
    const start = {};
    if (startDate) start["$gte"] = startDate;
    if (endDate) start["$lte"] = endDate;

    newMatch.date = start;
  }
  
  if (typeof isPresential === "boolean") {
    newMatch.isPresential = isPresential;
  }

  if (typeof newMatch.memberIds === "object") {
    const memberIdsAsObjectIds = newMatch.memberIds.map(memberId => mongoose.Types.ObjectId(memberId));
    if (newMatch.memberIds.length > 0) {
      newMatch.memberId = { $in: memberIdsAsObjectIds }
      delete newMatch.memberId;
    }
  }

  delete newMatch.memberIds;

  return this.aggregate([
    {
      $match: newMatch,
    },
    {
      $addFields: {
        duration: { $subtract: ["$end", "$start"] },
      },
    },
    {
      $lookup: {
        from: "members",
        localField: "memberId",
        foreignField: "_id",
        as: "member",
      },
    },
    {
      $unwind: {
        path: "$member",
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
  ]);
};

AditionalHourSchema.statics.getAllMembersSessions = function (
  match,
  { startDate, endDate },
  { isPresential }
) {
  const newMatch = { ...match };

  if (startDate || endDate) {
    const start = {};
    if (startDate) start["$gte"] = startDate;
    if (endDate) start["$lte"] = endDate;

    newMatch.start = start;
  }

  if (typeof isPresential === "boolean") {
    newMatch.isPresential = isPresential;
  }

  return this.aggregate([
    {
      $match: newMatch,
    },
    {
      $addFields: {
        duration: { $subtract: ["$end", "$start"] },
      },
    },
  ]);
};

const AditionalHourModel = mongoose.model(
  "aditionalHours",
  AditionalHourSchema
);

export default AditionalHourModel;
