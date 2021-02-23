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

SessionSchema.statics.findMandatoriesReport = async function (
  memberId,
  startWeekYear,
  startWeeknumber,
  endWeekYear,
  endWeeknumber
) {
  const startDate = DateTime.fromObject({
    weekYear: startWeekYear,
    weeknumber: startWeeknumber,
    weekday: 1,
  });
  const endDate = DateTime.fromObject({
    weekYear: endWeekYear,
    weeknumber: endWeeknumber,
    weekday: 1,
  });
  const start = startDate.toJSDate();
  const end = endDate.toJSDate();

  let compiled = await this.aggregate([
    {
      $match: {
        memberId: mongoose.Types.ObjectId(memberId),
        $expr: {
          $and: [
            {
              $not: {
                $or: [
                  {
                    $and: [
                      {
                        $lt: [end, "$start"],
                      },
                      { $lt: [end, "$end"] },
                    ],
                  },
                  {
                    $and: [
                      {
                        $gt: [start, "$start"],
                      },
                      { $gt: [start, "$end"] },
                    ],
                  },
                ],
              },
            },
          ],
        },
      },
    },
    {
      $addFields: {
        start: {
          at: "$start",
          Y: { $year: "$start" },
          W: { $isoWeek: "$start" },
          D: { $dayOfMonth: "$start" },
          WD: { $dayOfWeek: "$start" },
          ts: {
            $sum: [
              { $second: "$start" },
              { $multiply: [{ $minute: "$start" }, 60] },
              { $multiply: [{ $hour: "$start" }, 60, 60] },
            ],
          },
        },
        end: {
          at: "$end",
          Y: { $year: "$end" },
          W: { $isoWeek: "$end" },
          D: { $dayOfMonth: "$end" },
          WD: { $dayOfWeek: "$end" },
          ts: {
            $sum: [
              { $second: "$end" },
              { $multiply: [{ $minute: "$end" }, 60] },
              { $multiply: [{ $hour: "$end" }, 60, 60] },
            ],
          },
        },
      },
    },
    {
      $addFields: {
        "end._id": {
          $concat: [{ $toString: "$end.Y" }, "-", { $toString: "$end.W" }],
        },
        "start._id": {
          $concat: [{ $toString: "$start.Y" }, "-", { $toString: "$start.W" }],
        },
      },
    },
    {
      $group: {
        _id: "$memberId",
        sessions: {
          $addToSet: "$$ROOT",
        },
        groups1: {
          $addToSet: "$start._id",
        },
        groups2: {
          $addToSet: "$end._id",
        },
      },
    },
    {
      $project: {
        sessions: 1,
        groups: { $setUnion: ["$groups1", "$groups2"] },
      },
    },
    {
      $unwind: {
        path: "$groups",
      },
    },
    {
      $project: {
        _id: 1,
        group: "$groups",
        sessions: {
          $filter: {
            input: "$sessions",
            as: "item",
            cond: {
              $or: [
                { $eq: ["$$item.end._id", "$groups"] },
                { $eq: ["$$item.start._id", "$groups"] },
              ],
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "members",
        localField: "_id",
        foreignField: "_id",
        as: "members",
      },
    },
    {
      $project: {
        _id: 1,
        group: 1,
        sessions: 1,
        "members.mandatories": 1,
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$members", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $project: {
        _id: 1,
        group: 1,
        sessions: 1,
        mandatory: "$mandatories",
      },
    },
    {
      $unwind: {
        path: "$mandatory",
      },
    },
    {
      $addFields: {
        mandatory: {
          startAt: {
            at: "$mandatory.startAt",
            ts: {
              $sum: [
                { $second: "$mandatory.startAt" },
                { $multiply: [{ $minute: "$mandatory.startAt" }, 60] },
                { $multiply: [{ $hour: "$mandatory.startAt" }, 60, 60] },
              ],
            },
          },
          endAt: {
            at: "$mandatory.endAt",
            ts: {
              $sum: [
                { $second: "$mandatory.endAt" },
                { $multiply: [{ $minute: "$mandatory.endAt" }, 60] },
                { $multiply: [{ $hour: "$mandatory.endAt" }, 60, 60] },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        group: 1,
        mandatory: 1,
        sessions: {
          $filter: {
            input: "$sessions",
            as: "item",
            cond: {
              $and: [
                {
                  $or: [
                    { $eq: ["$$item.start.WD", "$mandatorie.weekDay"] },
                    { $eq: ["$$item.end.WD", "$mandatorie.weekDay"] },
                  ],
                },
                {
                  $not: {
                    $or: [
                      {
                        $and: [
                          { $lt: ["$mandatorie.endAt.ts", "$$item.start.ts"] },
                          { $eq: ["$mandatorie.weekDay", "$$item.start.wD"] },
                        ],
                      },
                      {
                        $and: [
                          { $gt: ["$mandatorie.start.ts", "$$item.end.ts"] },
                          { $eq: ["$mandatorie.weekDay", "$$item.end.wD"] },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
        weekday: "$mandatory.weekDay",
        expectedDuration: {
          $subtract: ["$mandatory.endAt.ts", "$mandatory.startAt.ts"],
        },
      },
    },
    {
      $addFields: {
        group: {
          $concat: ["$group", "-", { $toString: "$mandatory.weekDay" }],
        },
      },
    },
    {
      $group: {
        _id: "$group",
        mandatories: {
          $addToSet: {
            sessions: "$sessions",
            mandatory: "$mandatory",
            expectedDuration: "$expectedDuration",
          },
        },
      },
    },
    {
      $addFields: {
        data: { $split: ["$_id", "-"] },
      },
    },
    {
      $project: {
        mandatories: 1,
        Y: { $toInt: { $arrayElemAt: ["$data", 0] } },
        W: { $toInt: { $arrayElemAt: ["$data", 1] } },
        WD: { $toInt: { $arrayElemAt: ["$data", 2] } },
      },
    },
  ]);

  compiled = compiled.map((compiled) => {
    let compiledMandatories = [...compiled.mandatories];

    // Formatação dos mandatories
    compiledMandatories = compiledMandatories.map((compiledMandatory) => {
      let duration = 0;
      // Calculo da duração das sessoes
      // e Formatação da sessions
      const sessions = compiledMandatory.sessions.map((session) => {
        let start;
        let end;
        if (
          session.start.ts >= compiledMandatory.startAt.ts &&
          compiledMandatory.startAt.W === session.start.W &&
          compiledMandatory.startAt.Y === session.start.Y
        )
          start = session.start.ts;
        else start = compiledMandatory.startAt.ts;

        if (
          session.end.ts <= compiledMandatory.endAt.ts &&
          compiledMandatory.endAt.W === session.end.W &&
          compiledMandatory.endAt.Y === session.end.Y
        )
          end = session.end.ts;
        else end = compiledMandatory.endAt.ts;

        duration += end - start;

        return { ...session, end: session.end.at, start: session.start.at };
      });

      const newMandatory = {
        ...compiledMandatory.mandatory,
        startAt: compiledMandatory.mandatory.startAt.at,
        endAt: compiledMandatory.mandatory.endAt.at,
      };

      return {
        ...compiledMandatory,
        mandatory: newMandatory,
        sessions,
        duration,
      };
    });

    return {
      date: DateTime.fromObject({
        weekYear: compiled.Y,
        weeknumber: compiled.W,
        weekday: compiled.WD,
      }).toJSDate(),
      mandatories: compiledMandatories,
    };
  });

  let mandatoriesList = await MemberModel.findById(memberId).select(
    "mandatories"
  );
  mandatoriesList = mandatoriesList.toJSON().mandatories;

  const weekDays = [];
  const weekDaysMandatory = {};

  mandatoriesList.forEach((m) => {
    const wd = m.weekDay;

    if (weekDays.indexOf(wd) === -1) weekDays.push(wd);

    if (!weekDaysMandatory[wd]) weekDaysMandatory[wd] = [];
    weekDaysMandatory[wd].push(m);
  });

  // Preenchimento das lacunas
  for (let year = startWeekYear; year <= endWeekYear; year++)
    for (let week = startWeeknumber; week <= endWeeknumber; week++)
      weekDays.forEach((wd) => {
        const date = DateTime.fromObject({
          weekYear: year,
          weeknumber: week,
          weekday: wd,
        }).toJSDate();

        if (compiled.findIndex((compile) => compile.date === date) === -1) {
          const data = {
            date,
            mandatories: [],
          };

          weekDaysMandatory[wd].forEach((m) => {
            data.mandatories.push({
              mandatory: m,
              sessions: [],
              duration: 0,
              expectedDuration: m.endAt - m.startAt,
            });
          });

          compiled.push(data);
        }
      });

  _.orderBy(compiled, "date");
  return compiled;
};

const SessionModel = mongoose.model("sessions", SessionSchema);

export default SessionModel;
