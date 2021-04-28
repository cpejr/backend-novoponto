import mongoose from "mongoose";
import { DateTime } from "luxon";
import _ from "lodash";
import { castToObjectIdFields } from "../utils/modelsFunctions";
import { MemberModel } from "./";

const SessionSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "members",
      required: true,
    },
    start: { type: Date, required: true },
    end: { type: Date, default: null },
  },
  { timestamps: false, versionKey: false }
);

SessionSchema.virtual("member", {
  ref: "members", // The model to use
  localField: "memberId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true,
});

SessionSchema.statics.findByDateRangeWithDuration = async function (
  match,
  { startDate, endDate }
) {
  const newMatch = { ...match };

  castToObjectIdFields(newMatch, ["memberId", "_id"]);

  if (startDate || endDate) {
    const start = {};
    if (startDate) start["$gte"] = startDate;
    if (endDate) start["$lte"] = endDate;

    newMatch.start = start;
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

SessionSchema.statics.getLoggedMembers = async function () {
  return this.aggregate([
    {
      $match: {
        end: null,
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
        preserveNullAndEmptyArrays: true
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
        preserveNullAndEmptyArrays: true
      },
    },
  ]);
};

const SessionModel = mongoose.model("sessions", SessionSchema);

export default SessionModel;
