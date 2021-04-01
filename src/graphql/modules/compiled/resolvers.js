import { JustificativeModel, MemberModel, SessionModel } from "../../../models";
import { mili2time } from "../../../utils/dateFunctions";

export default {
  CompiledMember: {
    formatedTotal: ({ total }) => {
      let dur = total;

      if (!dur) dur = 0;

      return mili2time(dur);
    },
  },

  SessionsReport: {
    formatedTotal: ({ total }) => {
      let dur = total;

      if (!dur) dur = 0;

      return mili2time(dur);
    },
  },

  Query: {
    compiled: async (_, { memberId, startDate, endDate }) => {
      let sessions = SessionModel.findByDateRangeWithDuration(
        { memberId },
        { startDate, endDate }
      );

      let justificatives = JustificativeModel.findByDateRangeWithDuration(
        { memberId },
        { startDate, endDate }
      );

      [sessions, justificatives] = await Promise.all([
        sessions,
        justificatives,
      ]);

      let total = 0;
      sessions.forEach((session) => (total += session.duration));
      justificatives.forEach(
        (justificative) => (total += justificative.amount)
      );

      return { sessions, total, justificatives };
    },

    getMandatoriesReport: async (
      _,
      { memberId, startWeekYear, startWeeknumber, endWeekYear, endWeeknumber }
    ) => {
      let report = await SessionModel.findMandatoriesReport(
        memberId,
        startWeekYear,
        startWeeknumber,
        endWeekYear,
        endWeeknumber
      );
      return report;
    },

    allMembersSessions: async (_, { startDate, endDate }) =>
      await MemberModel.getAllSessionsByDateRange({ startDate, endDate }),
  },
};
