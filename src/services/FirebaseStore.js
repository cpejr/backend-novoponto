// Imports the Google Cloud client library
import { Storage } from "@google-cloud/storage";
import path from "path";
import { v4 } from "uuid";

// Creates a client from a Google service account key.
const storage = new Storage({
  projectId: "ponto-cpe",
  credentials: {
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.CLIENT_EMAIL,
  },
});

const bucketName = process.env.BUCKET_NAME;

async function config() {
  try {
    await storage.bucket(bucketName);
    console.log("✅ Store initialized, connected to bucket: " + bucketName);
  } catch (error) {
    console.error(error);
  }
}

async function listFiles() {
  // Lists files in the bucket
  const [files] = await storage.bucket(bucketName).getFiles();

  console.log("Files:");
  files.forEach((file) => {
    console.log(file.name);
  });
}

async function uploadFile(file, folder) {
  return new Promise((resolve, reject) => {
    const fileName = `Public/${folder}/${Date.now()}${file.filename}`;
    //Sets the adress where the file will be stored
    const blob = storage.bucket(bucketName).file(fileName);
    //Create a writeStream that will receive the file data
    const blobWriter = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: v4(),
        },
      },
    });
    //Turns the file into readStream
    var readStream = file.createReadStream();
    //Pushes the readStrem content into writeStream on bucket
    readStream.pipe(blobWriter);
    // If there's an error
    blobWriter.on("error", (err) => {
      console.warn(err);
      reject(err);
    });
    // If all is good and done
    blobWriter.on("finish", () => {
      // Assembling public URL for accessing the file via HTTP
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
        blob.name
      )}?alt=media`;

      // Return the file's public URL
      resolve(publicUrl);
    });
  });
}

async function deleteFolder(folderName) {
  // Deletes the file from the bucket
  await storage.bucket(bucketName).deleteFiles({ prefix: folderName });
}

module.exports = {
  config,
  listFiles,
  uploadFile,
  deleteFolder,
};
