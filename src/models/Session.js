import mongoose from "mongoose";
import { DateTime } from "luxon";
import _ from "lodash";
import { castToObjectIdFields } from "../utils/modelsFunctions";
import { MemberModel } from "./";
import { TaskModel } from "./";

const SessionSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "members",
      required: true,
    },
    start: { type: Date, required: true },
    end: { type: Date, default: null },
    isPresential: { type: Boolean, default: false, required: true },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tasks",
      required: false,
    },
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

SessionSchema.virtual("task", {
  ref: "tasks", // The model to use
  localField: "taskId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  // If `justOne` is true, tasks' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true,
});

SessionSchema.statics.findByDateRangeWithDuration = async function (
  match,
  { startDate, endDate },
  { isPresential }
) {
  const newMatch = { ...match };

  castToObjectIdFields(newMatch, ["memberId", "_id"]);

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
    {
      $lookup: {
        from: "tasks",
        localField: "taskId",
        foreignField: "_id",
        as: "task",
      },
    },
    {
      $unwind: {
        path: "$task",
        preserveNullAndEmptyArrays: true,
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
        preserveNullAndEmptyArrays: true,
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
        from: "departaments",
        localField: "member.departamentId",
        foreignField: "_id",
        as: "member.departament",
      },
    },
    {
      $unwind: {
        path: "$member.departament",
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
      $lookup: {
        from: "tasks",
        localField: "taskId",
        foreignField: "_id",
        as: "task",
      },
    },
    {
      $unwind: {
        path: "$task",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        start: -1,
      },
    },
  ]);
};

const SessionModel = mongoose.model("sessions", SessionSchema);

export default SessionModel;
