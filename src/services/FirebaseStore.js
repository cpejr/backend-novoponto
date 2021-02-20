// Imports the Google Cloud client library
import { Storage } from "@google-cloud/storage";
import path from "path";
import { v4 } from "uuid";

// Creates a client from a Google service account key.
const storage = new Storage({
  projectId: "ponto-cpe",
  keyFilename: "./ServiceAccountKey.json",
});

async function config() {
  try {
    const bucketName = process.env.BUCKET_NAME;
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

async function uploadFile(file, userId, prefix = "") {
  return new Promise((resolve, reject) => {
    const fileName = `${userId}-${Date.now()}${path
      .extname(file.originalname)
      .replace(".", "-")}`;

    const blob = storage.bucket(bucketName).file(`${prefix}${fileName}`);
    const blobWriter = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: v4(),
        },
      },
    });

    // If there's an error
    blobWriter.on("error", (err) => {
      console.warn(err);
      reject(err);
    });
    // If all is good and done
    blobWriter.on("finish", () => {
      // Assembling public URL for accessing the file via HTTP
      // const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
      //   blob.name
      // )}?alt=media`;

      // Return the file name and its public URL
      resolve(blob.name);
    });
    // When there is no more data to be consumed from the stream the end event gets emitted
    blobWriter.end(file.buffer);
  });
}

async function deleteFile(filename) {
  // Deletes the file from the bucket
  await storage.bucket(bucketName).file(filename).delete();
}

module.exports = {
  config,
  listFiles,
  uploadFile,
  deleteFile,
};
