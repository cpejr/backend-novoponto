import cron from "node-cron";
import { SessionModel } from "../../../models";
import {MemberModel} from "../../../models";
import {AditionalHourModel} from "../../../models";
const  checkMemberHours  = async () => {
    const fulltext = "";
    const members = await MemberModel.find()
    members.map((member)=> mapMemberHours(member))
}
const mapMemberHours = async (member) =>{
    const startOfWeek = new Date();
    startOfWeek.setUTCHours(0, 0, 0, 0);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay() + 1); // Ajusta para segunda-feira
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
    endOfWeek.setUTCHours(23, 59, 59, 999); 
    const sessions = await SessionModel.find({
         memberId: member._id,
         start: { $gte: startOfWeek, $lte: endOfWeek },
     });
     const additionalHours = await AditionalHourModel.find({
      memberId: member._id,
      date: { $gte: startOfWeek, $lte: endOfWeek },
  });
    console.log(additionalHours)
    console.log(`Member ${member.name} has ${sessions.length} and.`);
    const totalSessionHours = sessions.reduce((total, session) => {
      const sessionStart = new Date(session.start);
      const sessionEnd = session.end ? new Date(session.end) : new Date();
      return total + (sessionEnd - sessionStart)
  }, 0);
  console.log(totalSessionHours)

}

export const startMemberCron = () => {
    cron.schedule("0 * * * * *", () => {
      checkMemberHours()
    });
  };
  