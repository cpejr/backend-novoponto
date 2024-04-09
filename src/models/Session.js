import mongoose from "mongoose";
import { DateTime } from "luxon";
import _ from "lodash";
import { castToObjectIdFields } from "../utils/modelsFunctions";
import { MemberModel } from "./";
import { TaskModel } from "./";
import { ProjectModel } from "./Projects";

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
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
    description: {
      type: mongoose.Schema.Types.String,
      ref: "description",
    },
  },
  { timestamps: false, versionKey: false }
);

SessionSchema.virtual("member", {
  ref: "members",
  localField: "memberId",
  foreignField: "_id",
  justOne: true,
});

SessionSchema.virtual("role", {
  ref: "roles",
  localField: "member.roleId",
  foreignField: "_id",
  justOne: true,
});

SessionSchema.virtual("task", {
  ref: "tasks",
  localField: "taskId",
  foreignField: "_id",
  justOne: true,
});

SessionSchema.virtual("project", {
  ref: "projects",
  localField: "projectId",
  foreignField: "_id",
  justOne: true,
});

SessionSchema.virtual("tribe", {
  ref: "tribes",
  localField: "member.tribeId",
  foreignField: "_id",
  justOne: true,
});

SessionSchema.statics.findByDateRangeWithDuration = async function (
  match,
  { startDate, endDate },
  { isPresential }
) {
  const newMatch = { ...match };
  castToObjectIdFields(newMatch, ["memberId", "_id"]);
  const matchTribes = {};
  const matchRoles = {};
  const matchDepartaments = {};

  if (startDate || endDate) {
    const start = {};
    if (startDate) start["$gte"] = startDate;
    if (endDate) start["$lte"] = endDate;

    newMatch.start = start;
  }

  if (typeof isPresential === "boolean") {
    newMatch.isPresential = isPresential;
  }

  if (typeof newMatch.memberIds === "object") {
    const memberIdsAsObjectIds = newMatch.memberIds.map((memberId) =>
      mongoose.Types.ObjectId(memberId)
    );
    if (newMatch.memberIds.length > 0)
      newMatch.memberId = { $in: memberIdsAsObjectIds };
  }

  if (typeof newMatch.taskIds === "object") {
    const taskIdsAsObjectIds = newMatch.taskIds.map((taskId) =>
      mongoose.Types.ObjectId(taskId)
    );
    if (newMatch.taskIds.length > 0)
      newMatch.taskId = { $in: taskIdsAsObjectIds };
  }

  if (typeof newMatch.projectIds === "object") {
    const projectIdsAsObjectIds = newMatch.projectIds.map((projectId) =>
      mongoose.Types.ObjectId(projectId)
    );
    if (newMatch.projectIds.length > 0)
      newMatch.projectId = { $in: projectIdsAsObjectIds };
  }

  if (typeof newMatch.tribeIds === "object") {
    const tribeIdsAsObjectIds = newMatch.tribeIds.map((tribeId) =>
      mongoose.Types.ObjectId(tribeId)
    );
    if (newMatch.tribeIds.length > 0)
      matchTribes["member.tribeId"] = { $in: tribeIdsAsObjectIds };
  }

  if (typeof newMatch.roleIds === "object") {
    const roleIdsAsObjectIds = newMatch.roleIds.map((roleId) =>
      mongoose.Types.ObjectId(roleId)
    );
    if (newMatch.roleIds.length > 0)
      matchRoles["member.roleId"] = { $in: roleIdsAsObjectIds };
  }

  if (typeof newMatch.departamentIds === "object") {
    const departamentIdIdsAsObjectIds = newMatch.departamentIds.map(
      (departamentId) => mongoose.Types.ObjectId(departamentId)
    );

    if (newMatch.departamentIds.length > 0)
      matchDepartaments["member.role.departamentId"] = {
        $in: departamentIdIdsAsObjectIds,
      };
  }

  delete newMatch.departamentIds;
  delete newMatch.taskIds;
  delete newMatch.projectIds;
  delete newMatch.tribeIds;
  delete newMatch.roleIds;
  delete newMatch.memberIds;
  console.log("sd");
  const combinedMatch = { ...newMatch, ...matchDepartaments, ...matchTribes };
  console.log(combinedMatch);
  console.log("sf ");
  return this.aggregate([
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
        from: "departaments",
        localField: "member.role.departamentId",
        foreignField: "_id",
        as: "member.role.departament",
      },
    },
    {
      $unwind: {
        path: "$member.role.departament",
        preserveNullAndEmptyArrays: true,
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
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "project",
      },
    },
    {
      $unwind: {
        path: "$project",
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
      $match: combinedMatch,
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
        from: "departament",
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
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "project",
      },
    },
    {
      $unwind: {
        path: "$project",
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

SessionSchema.statics.findByDateRange = async function (startDate, endDate) {
  let sessions = this.find({
    start: { $gte: startDate },
    end: { $lte: endDate },
  })
    .populate("projectId")
    .populate("taskId")
    .populate({
      path: "memberId",
      populate: {
        path: "roleId",
      },
    })
    .populate({
      path: "memberId",
      populate: {
        path: "roleId",
        populate: {
          path: "departamentId",
        },
      },
    });

  return sessions;
};

const SessionModel = mongoose.model("sessions", SessionSchema);

export default SessionModel;
