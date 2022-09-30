import { AditionalHourModel, MemberModel, SessionModel } from "../../../models";
import moment from "moment";

export default {
  CompiledMember: {
    formatedTotal: ({ total }) => {
      return Number(total) <= 0 
        ? "00:00" 
        : moment.utc(total).format("HH:mm");

      // if (!dur) dur = 0;
      // console.log(moment.utc(dur).format('HH:mm'));
      // return mili2time(dur);
    },
  },

  SessionsReport: {
    formatedTotal: ({ total }) => {
      return Number(total) <= 0 
        ? "00:00" 
        : moment.utc(total).format("HH:mm");
    },
  },

  Query: {
    compiled: async (_, { memberId, startDate, endDate }) => {
      let sessions = SessionModel.findByDateRangeWithDuration(
        { memberId },
        { startDate, endDate }
      );

      let aditionalHours = AditionalHourModel.findByDateRangeWithDuration(
        { memberId },
        { startDate, endDate }
      );

      [sessions, aditionalHours] = await Promise.all([
        sessions,
        aditionalHours,
      ]);

      let total = 0;
      sessions.forEach((session) => (total += session.duration));
      aditionalHours.forEach(
        (aditionalHour) => (total += aditionalHour.amount)
      );

      return { sessions, total, aditionalHours };
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

    allMembersSessions: async (_, { startDate, endDate, compileGroup }) =>
      await MemberModel.getAllMembersDataForCompilation({
        startDate,
        endDate,
        compileGroup,
      }),
  },
};
