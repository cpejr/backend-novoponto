const admin = require("firebase-admin");
const firebase = require("firebase/app");
import dotenv from "dotenv";
dotenv.config();

const serviceAccount = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
};

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
