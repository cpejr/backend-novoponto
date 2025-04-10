import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  text: { type: String, required: true },
  link: { type: String, required: true },
  linkValidation: { type: String },
  expiresAt: { type: Date, default: null },
});
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const NotificationModel = mongoose.model("Notification", NotificationSchema);

export default NotificationModel;
