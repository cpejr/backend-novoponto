import { AditionalHourModel, MemberModel, SessionModel } from "../../../models";
import { mili2time, mili2timeWith4Digits } from "../../../utils/dateFunctions";

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
    formatedWorking: ({ totalWorking }) => {
      let dur = totalWorking;
      if (!dur) dur = 0;
      return mili2time(dur);
    },
    formatedMeeting: ({ totalMeeting }) => {
      let dur = totalMeeting;
      if (!dur) dur = 0;
      return mili2time(dur);
    },
  },
  CompiledSessions: {
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

      let aditionalHours = AditionalHourModel.findByDateRangeWithDuration(
        { memberId },
        { startDate, endDate },
        { isPresential }
      );

      [sessions, aditionalHours] = await Promise.all([
        sessions,
        aditionalHours,
      ]);

      let totalPresential = 0;
      let totalWorking = 0;
      let totalMeeting = 0;
      let total = 0;
      sessions.forEach((session) => {
        if (session.isPresential) {
          totalPresential += session.duration;
        }
        if (session.task.name == "Reunião Gerencial") {
          totalMeeting += session.duration;
        } else if (session.task.name == "Tarefas/Operacional") {
          totalWorking += session.duration;
        }
        total += session.duration;
      });
      aditionalHours.forEach((aditionalHour) => {
        total += aditionalHour.amount;
        console.log(aditionalHours);
        if (aditionalHour.isPresential) {
          totalPresential += aditionalHour.amount;
        }
      });

      return {
        sessions,
        total,
        aditionalHours,
        totalPresential,
        totalMeeting,
        totalWorking,
      };
    },

    allSessions: async (
      _,
      {
        startDate,
        endDate,
        isPresential,
        taskIds,
        projectIds,
        tribeIds,
        memberId,
      }
    ) => {
      try {
        const sessions = await SessionModel.findByDateRangeWithDuration(
          { memberId, taskIds, projectIds, tribeIds },
          { startDate, endDate },
          { isPresential }
        );

        let aditionalHours = [];

        if (
          taskIds.length === 0 &&
          projectIds.length === 0 &&
          tribeIds.length === 0
        ) {
          aditionalHours = await AditionalHourModel.findByDateRangeWithDuration(
            { memberId },
            { startDate, endDate },
            { isPresential }
          );
        }

        let totalPresential = 0;

        let total = 0;

        sessions.forEach((session) => {
          if (session.isPresential) {
            totalPresential += session.duration;
          }
          total += session.duration;
        });

        aditionalHours.forEach((aditionalHour) => {
          if (aditionalHour.isPresential) {
            totalPresential += aditionalHour.amount;
          }
          total += aditionalHour.amount;
        });

        return { sessions, total, totalPresential, aditionalHours };
      } catch (error) {
        throw new Error(error);
      }
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
