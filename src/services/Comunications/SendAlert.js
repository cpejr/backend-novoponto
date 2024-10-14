const client = require("twilio")(process.env.ACCOUNTSID, process.env.AUTHTOKEN);

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
