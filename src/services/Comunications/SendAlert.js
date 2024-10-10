import twilio from "twilio";

const accountSid = "AC8375911bb09f2383e89af8b56f8f9b58";
const authToken = "d8ef96ab64555104fdb00e047082eced";
const client = require("twilio")(accountSid, authToken);

export const sendAlert = (phoneNumber, message) => {
  client.messages
    .create({
      body: message,
      from: "+12024172808",
      to: phoneNumber,
    })
    .then((message) => console.log("Alert sent: " + message.sid))
    .catch((error) => console.error(error));
};
