import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String },
    required: { type: Boolean, required: true },
  },
  { timestamps: false, versionKey: false }
);

const EventModel = mongoose.model("events", EventSchema);

export default EventModel;
