import cron from "node-cron";
import { SessionModel } from "../../../models";
import {MemberModel} from "../../../models";
import {AditionalHourModel} from "../../../models";
import { mili2time } from "../../dateFunctions";
import transporter from "../../../services/Comunications/Nodemailer/smtp";
const  checkMemberHours  = async () => {
    
    const members = await MemberModel.find().populate({path:"roleId"})
    const manager = members.find((member)=> member.roleId.name == "Gerente de Clima e Membros")
    console.log(manager)
    if (!manager) {
        return;
    }
    const memberTexts = await Promise.all(members.map((member) => mapMemberHours(member)));
    const fulltext = memberTexts.join("\n")

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: manager.email, 
      subject: `Horas semanais dos membros`,
      text: fulltext
    };
    try{
      await transporter.sendMail(mailOptions)
      console.log("email enviado ")
    }catch(error){
      console.log(error)
    }
    
}
const mapMemberHours = async (member) =>{
    const startOfWeek = new Date();
    startOfWeek.setUTCHours(0, 0, 0, 0);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay() + 1);
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
    const hours = hoursSum(sessions,additionalHours); 

    const presentialTime = mili2time(hours.totalPresentialMilliseconds);
    const nonPresentialTime = mili2time(hours.totalNonPresentialMilliseconds);

    return "o membro " + member.name + " fez " + presentialTime + " presenciais e " + nonPresentialTime + " nao presenciais\n" ;
}
const hoursSum = (sessions, additionalHours) => {
  let totalPresentialMilliseconds = 0;
  let totalNonPresentialMilliseconds = 0;
  sessions.forEach(session => {
      if (session.start && session.end) {
          const start = new Date(session.start).getTime();
          const end = new Date(session.end).getTime();
          if (end > start) {
              const duration = end - start;
              if (session.isPresential) {
                  totalPresentialMilliseconds += duration;
              } else {
                  totalNonPresentialMilliseconds += duration;
              }
          }
      }
  });
  additionalHours.forEach(additionalHour => {
      if (additionalHour.amount) {
          if (additionalHour.isPresential) {
              totalPresentialMilliseconds += additionalHour.amount;
          } else {
              totalNonPresentialMilliseconds += additionalHour.amount;
          }
      }
  });
  return {
      totalPresentialMilliseconds,
      totalNonPresentialMilliseconds
  };
};

export const startMemberCron = () => {
    cron.schedule("0 0 23 * * 0", () => {
      checkMemberHours()
    });
  };
  