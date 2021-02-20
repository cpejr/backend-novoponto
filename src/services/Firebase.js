const admin = require("firebase-admin");
const firebase = require("firebase/app");

const serviceAccount = require("../../serviceAccountKey.json");
let db;

function config() {
  try {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

    firebase.initializeApp({
      apiKey: process.env.APIKEY,
      authDomain: process.env.AUTHDOMAIN,
      databaseURL: process.env.DATABASEURL,
      projectId: process.env.PROJECTID,
      storageBucket: process.env.STORAGEBUCKET,
      messagingSenderId: process.env.MESSAGINGSENDERID,
      appId: process.env.APPID,
      measurementId: process.env.MEASUREMENTID,
    });

    db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });

    console.log("✅ Firebase initialized");
  } catch (error) {
    console.error(error);
  }
}

function getDB() {
  return db;
}

module.exports = { admin, firebase, getDB, config };
