import mongoose from "mongoose";
import { castToObjectIdFields } from "../utils/modelsFunctions";

const JustificativeSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "members",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "events",
    },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    otherEventName: { type: String },
  },
  { timestamps: false, versionKey: false }
);

JustificativeSchema.virtual("member", {
  ref: "members", // The model to use
  localField: "memberId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true,
});

JustificativeSchema.statics.findByDateRangeWithDuration = function (
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

JustificativeSchema.statics.findByEventId = function (
  eventId
) {
  return JustificativeSchema.find();
};

JustificativeSchema.statics.getAllMembersSessions = function (
  match,
  { startDate, endDate }
) {
  const newMatch = { ...match };

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

const JustificativeModel = mongoose.model(
  "justificatives",
  JustificativeSchema
);

export default JustificativeModel;
