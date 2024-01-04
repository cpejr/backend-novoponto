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

      const timeDifference = endDate - startDate;
      const amountOfWeeks = timeDifference / (7 * 24 * 60 * 60 * 1000);

      console.log(amountOfWeeks);

      if (type === "departament") {
        const departaments = await DepartamentModel.find();
        const hours = {};
        departaments.forEach((departament) => (hours[departament.name] = 0));

        sessions.forEach((session) => {
          const departamentId = session?.member?.role?.departamentId.toString();
          if (departamentId) {
            const departament = departaments.find(
              (departament) => departament._id == departamentId
            );
            hours[departament.name] += session?.duration;
          }
        });
        console.log(hours);
        departaments.forEach(
          (departament) => (hours[departament.name] /= amountOfWeeks)
        );

        console.log(hours);
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
