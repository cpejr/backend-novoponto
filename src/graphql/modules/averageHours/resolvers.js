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
      let levelMembers = {};
      let departamentMembers = {};
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

        if(members[session?.memberId?.name] == null) {
          if(levelMembers[level] == null) {
            levelMembers[level] = 1;
          } else {
            levelMembers[level] += 1;
          }
          if(departamentMembers[departament] == null) {
            departamentMembers[departament] = 1;
          } else {
            departamentMembers[departament] += 1;
          }
          departamentMembers[departament] += 1;
        }
        members[session?.memberId?.name] = true;
      });
      

      //calculate average hours

      departaments.forEach((departament) => {
        if(departamentHours[departament.name] !== 0 && departamentMembers[departament.name] !== 0 )
        departamentHours[departament.name] = Math.round(departamentHours[departament.name] / departamentMembers[departament.name]);
      });

      levels.forEach((level) => {
        if (levelHours[level] !== 0 && levelMembers[level] !== 0)
        levelHours[level] = Math.round(levelHours[level] / levelMembers[level]);
      });
      
      //format the return message

      let message = formatOutput(departamentHours, "departament");
      message = message.concat(formatOutput(levelHours, "level"));
      console.log("OK")

      return message;
    },
  },
};
