const mongoose = require("mongoose");

function config() {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_SERVER}/${process.env.MONGO_DATABASE}?${process.env.MONGO_OPTIONS}`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );

    mongoose.connection.on("error", (error) => {
      console.log("❌ failed to connect to mongoDB");
      reject(error);
    });

    mongoose.connection.once("open", () => {
      console.log("✅ Established connection with mongodb");
      resolve();
    });
  });
}

export default { config };
