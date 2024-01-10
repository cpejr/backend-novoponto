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

      //initialize time variables
      const timeDifference = endDate - startDate;
      const amountOfWeeks = timeDifference / (7 * 24 * 60 * 60 * 1000);

      //initialize average hour variables
      const departaments = await DepartamentModel.find();
      const departamentHours = {};
      departaments.forEach(
        (departament) => (departamentHours[departament.name] = 0)
      );

      const levels = ["operacional", "tático", "estratégico"];
      const levelHours = {};
      levels.forEach((level) => (levelHours[level] = 0));

      //calculate hours sum
      sessions.forEach((session) => {
        const departament = session?.member?.role?.departament?.name;
        departamentHours[departament] += session?.duration;

        const level = session?.member?.role?.level;
        levelHours[level] += session?.duration;
      });

      //calculate average hours
      departaments.forEach(
        (departament) => (departamentHours[departament.name] /= amountOfWeeks)
      );
      levels.forEach((level) => (levelHours[level] /= amountOfWeeks));

      console.log(departamentHours);
      console.log(levelHours);

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
