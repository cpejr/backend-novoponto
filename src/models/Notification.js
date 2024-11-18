import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  text: { type: String, required: true },
  link: { type: String, required: true },
  linkValidation: { type: String },
});

const NotificationModel = mongoose.model("Notification", NotificationSchema);

export default NotificationModel;
