import {
  AditionalHourModel,
  MemberModel,
  SessionModel,
  RoleModel,
} from "../../../models";
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

      let total = 0;
      sessions.forEach((session) => {
        if (session.isPresential) {
          totalPresential += session.duration;
        }
        total += session.duration;
      });

      aditionalHours.forEach((aditionalHour) => {
        total += aditionalHour.amount;
        if (aditionalHour.isPresential) {
          totalPresential += aditionalHour.amount;
        }
      });

      return { sessions, total, aditionalHours, totalPresential };
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
        memberIds,
        departamentIds,
      }
    ) => {
      try {
        let sessions = await SessionModel.findByDateRangeWithDuration(
          { memberIds, taskIds, projectIds, tribeIds },
          { startDate, endDate },
          { isPresential }
        );
        if (departamentIds.length > 0) {
          let departamentFilteredSessions = [];
          sessions.forEach((session) => {
            if (
              departamentIds.includes(
                session.member.role.departamentId.toString()
              )
            )
              departamentFilteredSessions.push(session);
          });
          sessions = departamentFilteredSessions;
        }

        let aditionalHours = [];

        if (
          taskIds.length === 0 &&
          projectIds.length === 0 &&
          tribeIds.length === 0 &&
          departamentIds == 0
        ) {
          aditionalHours = await AditionalHourModel.findByDateRangeWithDuration(
            { memberIds },
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
      { startWeekYear, startWeeknumber, endWeekYear, endWeeknumber }
    ) => {
      let report = await SessionModel.findMandatoriesReport(
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
