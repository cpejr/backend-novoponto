import cron from "node-cron";
import { sendAlert } from "../../../services/Comunications/SendAlert";
import { SessionModel } from "../../../models";

const checkLoggedMembers = async () => {
  try {
    const loggedMembers = await SessionModel.getLoggedMembers();
    const currentTime = new Date();
    const terminatePromises = [];

    for (const session of loggedMembers) {
      const sessionStart = new Date(session.start);
      let hoursLoggedIn = (currentTime - sessionStart) / (1000 * 60 * 60);

      if (hoursLoggedIn >= 12) {
        terminatePromises.push(SessionModel.findByIdAndDelete(session._id));
      } else if (hoursLoggedIn >= 6) {
        hoursLoggedIn = hoursLoggedIn.toFixed(2);

        await sendAlert(
          session.member.phoneNumber,
          `Você está logado muito tempo! ${hoursLoggedIn} horas.`
        );
      }
    }

    await Promise.all(terminatePromises);
  } catch (error) {
    console.error("Erro ao verificar usuários logados", error);
  }
};

export const startCronWork = () => {
  cron.schedule("0 * * * * *", () => {
    checkLoggedMembers();
  });
};
