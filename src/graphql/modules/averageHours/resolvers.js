import { startSession } from "mongoose";
import { DepartamentModel, MemberModel, SessionModel } from "../../../models";
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
      let sessions = await SessionModel.findByDateRange(start, end);

      //initialize variables
      const departamentHours = {};
      const levelHours = {};
      const members = {};
      const levels = ["operacional", "tático", "estratégico"];
      const departaments = await DepartamentModel.find();

      departaments.forEach(
        (departament) => (departamentHours[departament.name] = 0)
      );

      levels.forEach((level) => (levelHours[level] = 0));

      //calculate hours sum
      sessions.forEach((session) => {
        const duration = session?.end - session?.start;
        const departament = session?.memberId?.roleId?.departamentId?.name;
        departamentHours[departament] += duration;

        const level = session?.memberId?.roleId?.level;
        levelHours[level] += duration;

        members[session?.memberId] = true;
      });

      const numberOfMembers = Object.keys(members).length;

      //calculate average hours

      departaments.forEach((departament) => {
        departamentHours[departament.name] /= numberOfMembers;
      });
      levels.forEach((level) => (levelHours[level] /= numberOfMembers));

      //format the return message

      let message = formatOutput(departamentHours, "departament");
      message = message.concat(formatOutput(levelHours, "level"));

      return message;
    },
  },
};
