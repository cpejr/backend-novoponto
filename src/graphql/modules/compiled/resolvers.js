import { AditionalHourModel, MemberModel, SessionModel } from "../../../models";
import { mili2time } from "../../../utils/dateFunctions";

export default {
  CompiledMember: {
    formatedTotal: ({ total }) => {
      let dur = total;

      if (!dur) dur = 0;

      return mili2time(dur);
    },
    formatedPresentialTotal: ({ totalPresential }) => {
      let dur = totalPresential;

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
    compiled: async (_, { memberId, startDate, endDate, isPresential }) => {
      let sessions = SessionModel.findByDateRangeWithDuration(
        { memberId },
        { startDate, endDate },
        { isPresential }
      );

      const data = (await sessions).map(({ duration }) => mili2time(duration));

      let aditionalHours = AditionalHourModel.findByDateRangeWithDuration(
        { memberId },
        { startDate, endDate },
        {isPresential}
      );

      [sessions, aditionalHours] = await Promise.all([
        sessions,
        aditionalHours,
      ]);
      
      let totalPresential = 0;

      let total = 0;
      sessions.forEach((session) => {
        if(session.isPresential){
          console.log('sessões presenciais: ',session);
          totalPresential += session.duration
        }
        total += session.duration;});
      
      aditionalHours.forEach(
        (aditionalHour) => {
          total += aditionalHour.amount;
          if(aditionalHour.isPresential){
            totalPresential += aditionalHour.amount;
          }
        }
      );
      
      return { sessions, total, aditionalHours, totalPresential };
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
