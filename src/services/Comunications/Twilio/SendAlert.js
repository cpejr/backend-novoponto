const Account = process.env.ACCOUNTSID;
const Token = process.env.AUTHTOKEN;
TwilioNumber = process.env.TWILIONUMBER;

const client = require("twilio")(Account, Token);

export const sendAlert = (phoneNumber, message) => {
  client.messages
    .create({
      body: message,
      from: TwilioNumber,
      to: phoneNumber,
    })
    .then((message) => console.log("Alert sent: " + message.sid))
    .catch((error) => console.error(error));
};
