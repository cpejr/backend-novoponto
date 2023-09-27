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
    isPresential: { type: Boolean, required: true },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
    initialHour: { type: String, required: true },
    finalHour: { type: String, required: true },
    coment: { type: String, required: true },
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

AditionalHourSchema.virtual("project", {
  ref: "projects",
  localField: "projectId",
  foreignField: "_id",
  justOne: true,
});

AditionalHourSchema.statics.findByDateRangeWithDuration = function (
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

    newMatch.date = start;
  }

  if (typeof isPresential === "boolean") {
    newMatch.isPresential = isPresential;
  }

  return this.aggregate([
    {
      $match: newMatch,
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
  ]);
};

const AditionalHourModel = mongoose.model(
  "aditionalHours",
  AditionalHourSchema
);

export default AditionalHourModel;
