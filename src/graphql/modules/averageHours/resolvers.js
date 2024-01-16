import { DepartamentModel, SessionModel } from "../../../models";
import { mili2time } from "../../../utils/dateFunctions";

function formatOutput(hours, type) {
  const message = [];
  for (const [name, duration] of Object.entries(hours)) {
    if (name && name != "undefined" && name != "null")
      message.push({
        type,
        name,
        duration,
      });
  }
  return message;
}

export default {
  Query: {
    averageHours: async (_, { type, start, end }) => {
      let sessions = await SessionModel.findByDateRangeWithDuration(
        {},
        { start, end },
        {}
      );

      //initialize time variables
      const timeDifference = end - start;
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

      //format the return message
      let message = formatOutput(departamentHours, "departament");
      message = message.concat(formatOutput(levelHours, "level"));
      return message;
    },
  },
};
