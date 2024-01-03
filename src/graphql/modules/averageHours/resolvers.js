import { DepartamentModel, SessionModel } from "../../../models";
import { mili2time } from "../../../utils/dateFunctions";

export default {
  Query: {
    averageHours: async (_, { type, startDate, endDate }) => {
      let sessions = await SessionModel.findByDateRangeWithDuration(
        {},
        { startDate, endDate },
        {}
      );

      if (type === "departament") {
        const departaments = await DepartamentModel.find();
        const hours = {};
        for (let departament of departaments) {
          hours[departament.name] = 0;
        }

        sessions.forEach((session) => {
          const departamentId = session?.member?.role?.departamentId.toString();
          if (departamentId) {
            const departament = departaments.find(
              (departament) => departament._id == departamentId
            );
            hours[departament.name] += session?.duration;
          }
        });
      }

      const test = [
        {
          name: "funcionando",
          type,
          duration: 1,
          formattedDuration: "1",
        },
        {
          name: "sfd",
          type,
          duration: 1,
          formattedDuration: "1",
        },
      ];
      return test;
    },
  },
};
